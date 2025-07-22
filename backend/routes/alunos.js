const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllAlunos,
  getAlunoById,
  createAluno,
  updateAluno,
  deleteAluno
} = require('../controllers/alunosController');

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/alunos - Listar todos os alunos
router.get('/', getAllAlunos);

// GET /api/alunos/:id - Buscar aluno por ID
router.get('/:id', getAlunoById);

// POST /api/alunos - Criar novo aluno
router.post('/', createAluno);

// PUT /api/alunos/:id - Atualizar aluno
router.put('/:id', updateAluno);

// DELETE /api/alunos/:id - Remover aluno
router.delete('/:id', deleteAluno);

module.exports = router;
