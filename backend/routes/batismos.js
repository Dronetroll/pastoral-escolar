const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/batismos - Listar todos os batismos
router.get('/', async (req, res) => {
  try {
    const batismos = await prisma.batismo.findMany({
      orderBy: { dataBatismo: 'desc' }
    });
    res.json(batismos);
  } catch (error) {
    console.error('Erro ao buscar batismos:', error);
    res.status(500).json({ error: 'Erro ao buscar batismos' });
  }
});

module.exports = router;
