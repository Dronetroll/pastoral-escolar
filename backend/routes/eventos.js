const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET todos os eventos com filtros avançados
router.get('/', async (req, res) => {
  try {
    const { 
      categoria, 
      startDate, 
      endDate, 
      search, 
      responsavel,
      status = 'ativo',
      page = 1,
      limit = 50
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { ativo: status === 'ativo' };

    // Filtros
    if (categoria) where.categoria = categoria;
    if (responsavel) where.responsavel = { contains: responsavel, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
        { local: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (startDate && endDate) {
      where.dataInicio = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [eventos, total] = await Promise.all([
      prisma.evento.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          participantes: {
            select: {
              id: true,
              nome: true,
              email: true,
              confirmado: true
            }
          },
          _count: {
            select: { participantes: true }
          }
        },
        orderBy: { dataInicio: 'asc' }
      }),
      prisma.evento.count({ where })
    ]);

    res.json({
      eventos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos' });
  }
});

// GET evento por ID com detalhes completos
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const evento = await prisma.evento.findUnique({
      where: { id },
      include: {
        participantes: {
          include: {
            alunoAdventista: {
              select: { nome: true, turma: true, serie: true }
            }
          }
        },
        recurso: true
      }
    });

    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json(evento);
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ error: 'Erro ao buscar evento' });
  }
});

// POST criar evento avançado
router.post('/', async (req, res) => {
  try {
    const {
      titulo,
      descricao,
      categoria,
      dataInicio,
      dataFim,
      local,
      responsavel,
      publicoAlvo,
      estimativaParticipantes,
      cor,
      prioridade = 'MEDIA',
      recurso = {},
      recorrencia = {},
      notificacoes = {}
    } = req.body;

    if (!titulo || !dataInicio || !dataFim) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios: título, data início e data fim' 
      });
    }

    const evento = await prisma.evento.create({
      data: {
        titulo,
        descricao,
        categoria,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        local,
        responsavel,
        publicoAlvo,
        estimativaParticipantes: estimativaParticipantes ? parseInt(estimativaParticipantes) : null,
        cor,
        prioridade,
        ativo: true,
        // Campos avançados
        recurso: recurso.necessario ? {
          create: {
            equipamentos: recurso.equipamentos || [],
            materiais: recurso.materiais || [],
            pessoal: recurso.pessoal || [],
            orcamento: recurso.orcamento || 0
          }
        } : undefined,
        // Configurações de recorrência
        tipoRecorrencia: recorrencia.tipo || null,
        intervalorRecorrencia: recorrencia.intervalo || null,
        dataFimRecorrencia: recorrencia.dataFim ? new Date(recorrencia.dataFim) : null,
        diasSemana: recorrencia.diasSemana || [],
        // Configurações de notificação
        notificarAntes: notificacoes.antes || [],
        notificarParticipantes: notificacoes.participantes || false,
        notificarResponsavel: notificacoes.responsavel || true
      },
      include: {
        recurso: true,
        participantes: true
      }
    });

    // Criar eventos recorrentes se necessário
    if (recorrencia.tipo && recorrencia.tipo !== 'NENHUMA') {
      await criarEventosRecorrentes(evento, recorrencia);
    }

    res.status(201).json(evento);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});

// PUT atualizar evento
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const evento = await prisma.evento.update({
      where: { id },
      data: {
        ...updateData,
        dataInicio: updateData.dataInicio ? new Date(updateData.dataInicio) : undefined,
        dataFim: updateData.dataFim ? new Date(updateData.dataFim) : undefined,
      },
      include: {
        participantes: true,
        recurso: true
      }
    });

    res.json(evento);
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
});

// DELETE evento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.evento.update({
      where: { id },
      data: { ativo: false }
    });

    res.json({ message: 'Evento removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover evento:', error);
    res.status(500).json({ error: 'Erro ao remover evento' });
  }
});

// GET categorias de eventos
router.get('/admin/categorias', async (req, res) => {
  try {
    const categorias = await prisma.evento.findMany({
      select: { categoria: true },
      distinct: ['categoria'],
      where: { categoria: { not: null } }
    });

    const categoriasDefault = [
      'Culto', 'Reunião', 'Evento Especial', 'Treinamento', 
      'Batismo', 'Classe Bíblica', 'Escola Saudável', 
      'Atividade Pastoral', 'Administrativo'
    ];

    const todasCategorias = [
      ...categoriasDefault,
      ...categorias.map(c => c.categoria).filter(c => !categoriasDefault.includes(c))
    ];

    res.json(todasCategorias);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// GET estatísticas do calendário
router.get('/admin/estatisticas', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const currentDate = new Date();
    const targetMonth = mes ? parseInt(mes) : currentDate.getMonth() + 1;
    const targetYear = ano ? parseInt(ano) : currentDate.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);

    const [
      totalEventos,
      eventosPorCategoria,
      eventosProximos,
      participacaoTotal
    ] = await Promise.all([
      // Total de eventos no mês
      prisma.evento.count({
        where: {
          dataInicio: { gte: startDate, lte: endDate },
          ativo: true
        }
      }),
      // Eventos por categoria
      prisma.evento.groupBy({
        by: ['categoria'],
        where: {
          dataInicio: { gte: startDate, lte: endDate },
          ativo: true
        },
        _count: { id: true }
      }),
      // Próximos eventos (7 dias)
      prisma.evento.findMany({
        where: {
          dataInicio: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          ativo: true
        },
        take: 5,
        orderBy: { dataInicio: 'asc' }
      }),
      // Total de participações
      prisma.participanteEvento.count({
        where: {
          evento: {
            dataInicio: { gte: startDate, lte: endDate },
            ativo: true
          }
        }
      })
    ]);

    res.json({
      periodo: { mes: targetMonth, ano: targetYear },
      totalEventos,
      eventosPorCategoria: eventosPorCategoria.map(item => ({
        categoria: item.categoria || 'Sem categoria',
        total: item._count.id
      })),
      eventosProximos,
      participacaoTotal,
      mediaParticipantesPorEvento: totalEventos > 0 ? 
        Math.round(participacaoTotal / totalEventos) : 0
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// Função auxiliar para criar eventos recorrentes
async function criarEventosRecorrentes(eventoBase, recorrencia) {
  const { tipo, intervalo, dataFim, diasSemana } = recorrencia;
  const eventos = [];
  const dataInicio = new Date(eventoBase.dataInicio);
  const dataFinal = new Date(dataFim);
  
  let proximaData = new Date(dataInicio);
  proximaData.setDate(proximaData.getDate() + 1); // Começar a partir do próximo dia

  while (proximaData <= dataFinal) {
    let criarEvento = false;

    switch (tipo) {
      case 'DIARIO':
        criarEvento = true;
        proximaData.setDate(proximaData.getDate() + (intervalo || 1));
        break;
      case 'SEMANAL':
        if (diasSemana && diasSemana.includes(proximaData.getDay())) {
          criarEvento = true;
        }
        proximaData.setDate(proximaData.getDate() + 1);
        break;
      case 'MENSAL':
        if (proximaData.getDate() === dataInicio.getDate()) {
          criarEvento = true;
        }
        proximaData.setDate(proximaData.getDate() + 1);
        break;
    }

    if (criarEvento) {
      const novaDataFim = new Date(proximaData);
      const duracaoOriginal = eventoBase.dataFim - eventoBase.dataInicio;
      novaDataFim.setTime(novaDataFim.getTime() + duracaoOriginal);

      eventos.push({
        titulo: eventoBase.titulo,
        descricao: eventoBase.descricao,
        categoria: eventoBase.categoria,
        dataInicio: new Date(proximaData),
        dataFim: novaDataFim,
        local: eventoBase.local,
        responsavel: eventoBase.responsavel,
        publicoAlvo: eventoBase.publicoAlvo,
        estimativaParticipantes: eventoBase.estimativaParticipantes,
        cor: eventoBase.cor,
        prioridade: eventoBase.prioridade,
        eventoRecorrenteId: eventoBase.id,
        ativo: true
      });
    }
  }

  if (eventos.length > 0) {
    await prisma.evento.createMany({ data: eventos });
  }
}

module.exports = router;
