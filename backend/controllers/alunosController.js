const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// GET /api/alunos - Listar todos os alunos adventistas
const getAllAlunos = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, ativo } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construir filtros
    const where = {};
    
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { turma: { contains: search, mode: 'insensitive' } },
        { serie: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (ativo !== undefined) {
      where.ativo = ativo === 'true';
    }

    const [alunos, total] = await Promise.all([
      prisma.alunoAdventista.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          comunidade: {
            select: {
              id: true,
              nome: true
            }
          }
        },
        orderBy: {
          nome: 'asc'
        }
      }),
      prisma.alunoAdventista.count({ where })
    ]);

    res.json({
      alunos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar os alunos'
    });
  }
};

// GET /api/alunos/:id - Buscar aluno por ID
const getAlunoById = async (req, res) => {
  try {
    const { id } = req.params;

    const aluno = await prisma.alunoAdventista.findUnique({
      where: { id },
      include: {
        comunidade: {
          select: {
            id: true,
            nome: true,
            responsavel: true,
            telefone: true
          }
        },
        classesBiblicas: {
          select: {
            id: true,
            nome: true,
            professor: true,
            horario: true
          }
        },
        atendimentosPastorais: {
          select: {
            id: true,
            titulo: true,
            data: true,
            tipo: true
          },
          orderBy: {
            data: 'desc'
          },
          take: 5
        }
      }
    });

    if (!aluno) {
      return res.status(404).json({ 
        error: 'Aluno não encontrado',
        message: 'O aluno solicitado não existe ou foi removido'
      });
    }

    res.json(aluno);
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar o aluno'
    });
  }
};

// POST /api/alunos - Criar novo aluno
const createAluno = async (req, res) => {
  try {
    const {
      nome,
      cpf,
      dataNascimento,
      telefone,
      email,
      endereco,
      turma,
      serie,
      periodo,
      responsavel,
      telefoneResponsavel,
      batizado,
      dataBatismo,
      igreja,
      comunidadeId,
      observacoes
    } = req.body;

    // Validações básicas
    if (!nome) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        message: 'Nome é obrigatório'
      });
    }

    // Verificar se CPF já existe (se fornecido)
    if (cpf) {
      const existingAluno = await prisma.alunoAdventista.findUnique({
        where: { cpf }
      });
      
      if (existingAluno) {
        return res.status(400).json({ 
          error: 'CPF já cadastrado',
          message: 'Já existe um aluno com este CPF'
        });
      }
    }

    const aluno = await prisma.alunoAdventista.create({
      data: {
        nome,
        cpf,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        telefone,
        email,
        endereco,
        turma,
        serie,
        periodo,
        responsavel,
        telefoneResponsavel,
        batizado: batizado || false,
        dataBatismo: dataBatismo ? new Date(dataBatismo) : null,
        igreja,
        comunidadeId,
        observacoes
      },
      include: {
        comunidade: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Aluno criado com sucesso',
      aluno
    });
  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar o aluno'
    });
  }
};

// PUT /api/alunos/:id - Atualizar aluno
const updateAluno = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome,
      cpf,
      dataNascimento,
      telefone,
      email,
      endereco,
      turma,
      serie,
      periodo,
      responsavel,
      telefoneResponsavel,
      batizado,
      dataBatismo,
      igreja,
      comunidadeId,
      observacoes,
      ativo
    } = req.body;

    // Verificar se o aluno existe
    const existingAluno = await prisma.alunoAdventista.findUnique({
      where: { id }
    });

    if (!existingAluno) {
      return res.status(404).json({ 
        error: 'Aluno não encontrado',
        message: 'O aluno solicitado não existe ou foi removido'
      });
    }

    // Verificar se CPF já existe em outro aluno (se fornecido e diferente do atual)
    if (cpf && cpf !== existingAluno.cpf) {
      const alunoWithCpf = await prisma.alunoAdventista.findUnique({
        where: { cpf }
      });
      
      if (alunoWithCpf) {
        return res.status(400).json({ 
          error: 'CPF já cadastrado',
          message: 'Já existe outro aluno com este CPF'
        });
      }
    }

    const aluno = await prisma.alunoAdventista.update({
      where: { id },
      data: {
        nome,
        cpf,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
        telefone,
        email,
        endereco,
        turma,
        serie,
        periodo,
        responsavel,
        telefoneResponsavel,
        batizado,
        dataBatismo: dataBatismo ? new Date(dataBatismo) : null,
        igreja,
        comunidadeId,
        observacoes,
        ativo
      },
      include: {
        comunidade: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    res.json({
      message: 'Aluno atualizado com sucesso',
      aluno
    });
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar o aluno'
    });
  }
};

// DELETE /api/alunos/:id - Remover aluno (soft delete)
const deleteAluno = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o aluno existe
    const existingAluno = await prisma.alunoAdventista.findUnique({
      where: { id }
    });

    if (!existingAluno) {
      return res.status(404).json({ 
        error: 'Aluno não encontrado',
        message: 'O aluno solicitado não existe ou já foi removido'
      });
    }

    // Soft delete - apenas desativar o aluno
    await prisma.alunoAdventista.update({
      where: { id },
      data: {
        ativo: false
      }
    });

    res.json({
      message: 'Aluno removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover aluno:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Não foi possível remover o aluno'
    });
  }
};

module.exports = {
  getAllAlunos,
  getAlunoById,
  createAluno,
  updateAluno,
  deleteAluno
};
