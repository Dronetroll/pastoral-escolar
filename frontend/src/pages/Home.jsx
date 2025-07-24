import React from 'react';
import { Users, Calendar, TrendingUp, Heart } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="card">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-secondary-600">{title}</p>
        <p className="text-2xl font-bold text-secondary-900">{value}</p>
        {trend && (
          <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% em relação ao mês anterior
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const Home = () => {
  const stats = [
    {
      title: 'Alunos Adventistas',
      value: '248',
      icon: Users,
      color: 'bg-blue-500',
      trend: 12
    },
    {
      title: 'Eventos este mês',
      value: '15',
      icon: Calendar,
      color: 'bg-green-500',
      trend: 5
    },
    {
      title: 'Batismos realizados',
      value: '32',
      icon: Heart,
      color: 'bg-purple-500',
      trend: 8
    },
    {
      title: 'Classes Ativas',
      value: '18',
      icon: TrendingUp,
      color: 'bg-orange-500',
      trend: -2
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <div className="text-center py-8">
          <h2 className="text-3xl font-bold text-secondary-900 mb-4">
            Bem-vindo ao Sistema Pastoral Escolar
          </h2>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Gerencie todos os aspectos da pastoral escolar adventista de forma integrada e eficiente. 
            Acompanhe alunos, eventos, batismos e muito mais em uma plataforma completa.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold text-secondary-900 mb-4">
            Ações Rápidas
          </h3>
          <div className="space-y-3">
            <button className="btn-primary w-full text-left">
              Cadastrar Novo Aluno Adventista
            </button>
            <button className="btn-outline w-full text-left">
              Agendar Evento
            </button>
            <button className="btn-outline w-full text-left">
              Registrar Batismo
            </button>
            <button className="btn-outline w-full text-left">
              Criar Relatório
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-secondary-900 mb-4">
            Próximos Eventos
          </h3>
          <div className="space-y-3">
            <div className="border-l-4 border-primary-500 pl-4 py-2">
              <p className="font-medium text-secondary-900">Culto de Quinta-feira</p>
              <p className="text-sm text-secondary-600">Hoje, 19:30</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="font-medium text-secondary-900">Classe Bíblica - Jovens</p>
              <p className="text-sm text-secondary-600">Sábado, 14:00</p>
            </div>
            <div className="border-l-4 border-orange-500 pl-4 py-2">
              <p className="font-medium text-secondary-900">Reunião de Planejamento</p>
              <p className="text-sm text-secondary-600">Segunda-feira, 15:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-xl font-semibold text-secondary-900 mb-4">
          Atividades Recentes
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-secondary-900">
                <span className="font-medium">Maria Silva</span> foi adicionada aos Alunos Adventistas
              </p>
              <p className="text-sm text-secondary-500">Há 2 horas</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-secondary-900">
                Evento <span className="font-medium">"Escola Saudável - Alimentação"</span> foi agendado
              </p>
              <p className="text-sm text-secondary-500">Ontem</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div>
              <p className="text-secondary-900">
                Batismo de <span className="font-medium">João Santos</span> foi registrado
              </p>
              <p className="text-sm text-secondary-500">2 dias atrás</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
