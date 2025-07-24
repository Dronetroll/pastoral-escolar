const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/batismos - Listar todos os batismos
const getAllBatismos = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ano, mes } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {};
    
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { igreja: { contains: search, mode: 'insensitive' } },
        { pastor: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (ano) {
      const startDate = new Date(`${ano}-01-01`);
      const endDate = new Date(`${ano}-12-31`);
      where.dataBatismo = {
        gte: startDate,
        lte: endDate
      };
    }

    if (mes && ano) {
      const startDate = new Date(`${ano}-${mes.padStart(2, '0')}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      where.dataBatismo = {
        gte: startDate,
        lte: endDate
      };
    }

    const [batismos, total] = await Promise.all([
      prisma.batismo.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          alunoAdventista: {
            select: {
              id: true,
              nome: true,
              turma: true,
              serie: true
            }
          }
        },
        orderBy: {
          dataBatismo: 'desc'
        }
      }),
      prisma.batismo.count({ where })
    ]);

    res.json({
      batismos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar batismos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar os batismos'
    });
  }
};

// GET /api/batismos/:id - Buscar batismo por ID
const getBatismoById = async (req, res) => {
  try {
    const { id } = req.params;

    const batismo = await prisma.batismo.findUnique({
      where: { id },
      include: {
        alunoAdventista: {
          select: {
            id: true,
            nome: true,
            turma: true,
            serie: true,
            email: true,
            telefone: true
          }
        }
      }
    });

    if (!batismo) {
      return res.status(404).json({ 
        error: 'Batismo não encontrado',
        message: 'O batismo solicitado não existe ou foi removido'
      });
    }

    res.json(batismo);
  } catch (error) {
    console.error('Erro ao buscar batismo:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar o batismo'
    });
  }
};

// POST /api/batismos - Criar novo batismo
const createBatismo = async (req, res) => {
  try {
    const {
      nome,
      cpf,
      dataNascimento,
      endereco,
      telefone,
      email,
      dataBatismo,
      igreja,
      pastor,
      observacoes,
      alunoAdventistaId,
      idade,
      responsavel,
      telefoneResponsavel
    } = req.body;

    // Validações básicas
    if (!nome || !dataBatismo || !igreja) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        message: 'Nome, data do batismo e igreja são obrigatórios'
      });
    }

    // Verificar se CPF já existe (se fornecido)
    if (cpf) {
      const existingBatismo = await prisma.batismo.findUnique({
        where: { cpf }
      });
      
      if (existingBatismo) {
        return res.status(400).json({ 
          error: 'CPF já cadastrado',
          message: 'Já existe um batismo registrado com este CPF'
        });
      }
    }

    // Se vinculado a um aluno, verificar se existe
    if (alunoAdventistaId) {
      const aluno = await prisma.alunoAdventista.findUnique({
        where: { id: alunoAdventistaId }
      });

      if (!aluno) {
        return res.status(400).json({ 
          error: 'Aluno não encontrado',
          message: 'O aluno selecionado não existe'
        });
      }

      // Atualizar status de batizado do aluno
      await prisma.alunoAdventista.update({
        where: { id: alunoAdventistaId },
        data: { 
          batizado: true,
          dataBatismo: new Date(dataBatismo),
          igreja: igreja
        }
      });
    }

    const batismo = await prisma.batismo.create({
      data: {
        nome,
        cpf,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        endereco,
        telefone,
        email,
        dataBatismo: new Date(dataBatismo),
        igreja,
        pastor,
        observacoes,
        alunoAdventistaId,
        idade: idade ? parseInt(idade) : null,
        responsavel,
        telefoneResponsavel
      },
      include: {
        alunoAdventista: {
          select: {
            id: true,
            nome: true,
            turma: true,
            serie: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Batismo registrado com sucesso',
      batismo
    });
  } catch (error) {
    console.error('Erro ao criar batismo:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível registrar o batismo'
    });
  }
};

// PUT /api/batismos/:id - Atualizar batismo
const updateBatismo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      cpf,
      dataNascimento,
      endereco,
      telefone,
      email,
      dataBatismo,
      igreja,
      pastor,
      observacoes,
      alunoAdventistaId,
      idade,
      responsavel,
      telefoneResponsavel
    } = req.body;

    // Verificar se o batismo existe
    const existingBatismo = await prisma.batismo.findUnique({
      where: { id }
    });

    if (!existingBatismo) {
      return res.status(404).json({ 
        error: 'Batismo não encontrado',
        message: 'O batismo solicitado não existe ou foi removido'
      });
    }

    // Verificar se CPF já existe em outro batismo (se fornecido e diferente do atual)
    if (cpf && cpf !== existingBatismo.cpf) {
      const batismoWithCpf = await prisma.batismo.findUnique({
        where: { cpf }
      });
      
      if (batismoWithCpf) {
        return res.status(400).json({ 
          error: 'CPF já cadastrado',
          message: 'Já existe outro batismo com este CPF'
        });
      }
    }

    const batismo = await prisma.batismo.update({
      where: { id },
      data: {
        nome,
        cpf,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        endereco,
        telefone,
        email,
        dataBatismo: new Date(dataBatismo),
        igreja,
        pastor,
        observacoes,
        alunoAdventistaId,
        idade: idade ? parseInt(idade) : null,
        responsavel,
        telefoneResponsavel
      },
      include: {
        alunoAdventista: {
          select: {
            id: true,
            nome: true,
            turma: true,
            serie: true
          }
        }
      }
    });

    res.json({
      message: 'Batismo atualizado com sucesso',
      batismo
    });
  } catch (error) {
    console.error('Erro ao atualizar batismo:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar o batismo'
    });
  }
};

// DELETE /api/batismos/:id - Remover batismo
const deleteBatismo = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o batismo existe
    const existingBatismo = await prisma.batismo.findUnique({
      where: { id }
    });

    if (!existingBatismo) {
      return res.status(404).json({ 
        error: 'Batismo não encontrado',
        message: 'O batismo solicitado não existe ou já foi removido'
      });
    }

    // Se vinculado a um aluno, atualizar status
    if (existingBatismo.alunoAdventistaId) {
      await prisma.alunoAdventista.update({
        where: { id: existingBatismo.alunoAdventistaId },
        data: { 
          batizado: false,
          dataBatismo: null,
          igreja: null
        }
      });
    }

    // Remover batismo
    await prisma.batismo.delete({
      where: { id }
    });

    res.json({
      message: 'Batismo removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover batismo:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível remover o batismo'
    });
  }
};

// GET /api/batismos/estatisticas - Estatísticas de batismos
const getEstatisticas = async (req, res) => {
  try {
    const { ano } = req.query;
    const currentYear = new Date().getFullYear();
    const targetYear = ano ? parseInt(ano) : currentYear;

    // Total de batismos no ano
    const totalBatismos = await prisma.batismo.count({
      where: {
        dataBatismo: {
          gte: new Date(`${targetYear}-01-01`),
          lte: new Date(`${targetYear}-12-31`)
        }
      }
    });

    // Batismos por mês
    const batismosPorMes = [];
    for (let mes = 1; mes <= 12; mes++) {
      const startDate = new Date(`${targetYear}-${mes.toString().padStart(2, '0')}-01`);
      const endDate = new Date(targetYear, mes, 0);
      
      const count = await prisma.batismo.count({
        where: {
          dataBatismo: {
            gte: startDate,
            lte: endDate
          }
        }
      });

      batismosPorMes.push({
        mes,
        nome: new Date(targetYear, mes - 1).toLocaleString('pt-BR', { month: 'long' }),
        total: count
      });
    }

    // Batismos por igreja
    const batismosPorIgreja = await prisma.batismo.groupBy({
      by: ['igreja'],
      where: {
        dataBatismo: {
          gte: new Date(`${targetYear}-01-01`),
          lte: new Date(`${targetYear}-12-31`)
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Batismos de alunos adventistas
    const batismosAlunosAdventistas = await prisma.batismo.count({
      where: {
        dataBatismo: {
          gte: new Date(`${targetYear}-01-01`),
          lte: new Date(`${targetYear}-12-31`)
        },
        alunoAdventistaId: {
          not: null
        }
      }
    });

    res.json({
      ano: targetYear,
      totalBatismos,
      batismosPorMes,
      batismosPorIgreja: batismosPorIgreja.map(item => ({
        igreja: item.igreja,
        total: item._count.id
      })),
      batismosAlunosAdventistas,
      percentualAlunosAdventistas: totalBatismos > 0 
        ? Math.round((batismosAlunosAdventistas / totalBatismos) * 100) 
        : 0
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar as estatísticas de batismos'
    });
  }
};

module.exports = {
  getAllBatismos,
  getBatismoById,
  createBatismo,
  updateBatismo,
  deleteBatismo,
  getEstatisticas
};
