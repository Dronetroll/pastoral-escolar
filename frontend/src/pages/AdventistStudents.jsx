import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Search } from 'lucide-react';

const AdventistStudents = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [turmaFilter, setTurmaFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');

  useEffect(() => {
    fetch('/api/alunos')
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(err => console.error('Erro ao buscar alunos:', err));
  }, []);

  // Filtrar alunos
  const filtered = students.filter(s => {
    const matchesSearch = s.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTurma = turmaFilter === 'Todas' || s.turma === turmaFilter;
    const matchesStatus =
      statusFilter === 'Todos' ||
      (statusFilter === 'Ativos' && s.ativo) ||
      (statusFilter === 'Inativos' && !s.ativo);
    return matchesSearch && matchesTurma && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Alunos Adventistas</h1>
          <p className="text-secondary-600">Gerencie e acompanhe os alunos adventistas da escola</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Novo Aluno</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar alunos..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select className="form-input" value={turmaFilter} onChange={e => setTurmaFilter(e.target.value)}>
              <option value="Todas">Todas as turmas</option>
              <option value="1º Ano">1º Ano</option>
              <option value="2º Ano">2º Ano</option>
              <option value="3º Ano">3º Ano</option>
            </select>
            <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="Todos">Todos</option>
              <option value="Ativos">Ativos</option>
              <option value="Inativos">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">Nome</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Turma</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200">
            {filtered.map(student => (
              <tr key={student.id}>
                <td className="px-4 py-2 text-sm">{student.nome}</td>
                <td className="px-4 py-2 text-sm">{student.turma || '-'}</td>
                <td className="px-4 py-2 text-sm">{student.ativo ? 'Ativo' : 'Inativo'}</td>
                <td className="px-4 py-2 text-sm">{student.email || '-'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-secondary-500">
                  Nenhum aluno encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdventistStudents;
