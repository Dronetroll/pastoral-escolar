import React, { useMemo } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Zap
} from 'lucide-react';

const CronogramaAnalytics = ({ events, dateRange = null }) => {
  const analytics = useMemo(() => {
    let filteredEvents = events;
    
    // Filtrar por intervalo de datas se especificado
    if (dateRange) {
      filteredEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= new Date(dateRange.start) && eventDate <= new Date(dateRange.end);
      });
    }

    // Estatísticas básicas
    const totalEvents = filteredEvents.length;
    const completedEvents = filteredEvents.filter(e => e.status === 'completed').length;
    const upcomingEvents = filteredEvents.filter(e => {
      const eventDateTime = new Date(`${e.date}T${e.startTime}`);
      return eventDateTime > new Date() && e.status === 'scheduled';
    }).length;
    const cancelledEvents = filteredEvents.filter(e => e.status === 'cancelled').length;

    // Por categoria
    const byCategory = filteredEvents.reduce((acc, event) => {
      const category = event.category || 'Sem categoria';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Por prioridade
    const byPriority = filteredEvents.reduce((acc, event) => {
      const priority = event.priority || 'Não definida';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    // Por responsável
    const byResponsavel = filteredEvents.reduce((acc, event) => {
      const responsavel = event.responsavel || 'Não definido';
      acc[responsavel] = (acc[responsavel] || 0) + 1;
      return acc;
    }, {});

    // Por dia da semana
    const byWeekday = filteredEvents.reduce((acc, event) => {
      const date = new Date(event.date);
      const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
      acc[weekday] = (acc[weekday] || 0) + 1;
      return acc;
    }, {});

    // Por mês
    const byMonth = filteredEvents.reduce((acc, event) => {
      const date = new Date(event.date);
      const month = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    // Duração média dos eventos
    const totalDuration = filteredEvents.reduce((acc, event) => {
      const start = new Date(`2000-01-01T${event.startTime}`);
      const end = new Date(`2000-01-01T${event.endTime}`);
      return acc + (end - start);
    }, 0);
    const averageDuration = totalEvents > 0 ? totalDuration / totalEvents : 0;
    const averageDurationHours = averageDuration / (1000 * 60 * 60);

    // Taxa de conclusão
    const completionRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;

    // Total de participantes
    const totalParticipants = filteredEvents.reduce((acc, event) => {
      return acc + (event.participants?.length || 0);
    }, 0);

    // Eventos com mais participantes
    const topEventsByParticipants = [...filteredEvents]
      .filter(e => e.participants && e.participants.length > 0)
      .sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0))
      .slice(0, 5);

    // Responsáveis mais ativos
    const topResponsaveis = Object.entries(byResponsavel)
      .filter(([name]) => name !== 'Não definido')
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      totalEvents,
      completedEvents,
      upcomingEvents,
      cancelledEvents,
      byCategory,
      byPriority,
      byResponsavel,
      byWeekday,
      byMonth,
      averageDurationHours,
      completionRate,
      totalParticipants,
      topEventsByParticipants,
      topResponsaveis
    };
  }, [events, dateRange]);

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend = null }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <TrendingUp className={`w-4 h-4 mr-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}% vs período anterior
          </span>
        </div>
      )}
    </div>
  );

  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  const ProgressBar = ({ label, value, total, color = 'blue' }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700">{label}</span>
          <span className="text-gray-500">{value} ({Math.round(percentage)}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-${color}-600 h-2 rounded-full transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Eventos"
          value={analytics.totalEvents}
          subtitle="No período selecionado"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Eventos Concluídos"
          value={analytics.completedEvents}
          subtitle={`${Math.round(analytics.completionRate)}% de conclusão`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Próximos Eventos"
          value={analytics.upcomingEvents}
          subtitle="Agendados"
          icon={Clock}
          color="orange"
        />
        <StatCard
          title="Total Participantes"
          value={analytics.totalParticipants}
          subtitle="Em todos os eventos"
          icon={Users}
          color="purple"
        />
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Categoria */}
        <ChartCard title="Eventos por Categoria">
          <div className="space-y-3">
            {Object.entries(analytics.byCategory)
              .sort(([,a], [,b]) => b - a)
              .map(([category, count]) => (
                <ProgressBar
                  key={category}
                  label={category}
                  value={count}
                  total={analytics.totalEvents}
                  color="emerald"
                />
              ))
            }
          </div>
        </ChartCard>

        {/* Por Prioridade */}
        <ChartCard title="Eventos por Prioridade">
          <div className="space-y-3">
            {Object.entries(analytics.byPriority)
              .sort(([,a], [,b]) => b - a)
              .map(([priority, count]) => {
                const color = priority === 'Alta' ? 'red' : priority === 'Média' ? 'yellow' : 'green';
                return (
                  <ProgressBar
                    key={priority}
                    label={priority}
                    value={count}
                    total={analytics.totalEvents}
                    color={color}
                  />
                );
              })
            }
          </div>
        </ChartCard>

        {/* Por Dia da Semana */}
        <ChartCard title="Distribuição por Dia da Semana">
          <div className="space-y-3">
            {Object.entries(analytics.byWeekday)
              .sort(([,a], [,b]) => b - a)
              .map(([weekday, count]) => (
                <ProgressBar
                  key={weekday}
                  label={weekday}
                  value={count}
                  total={analytics.totalEvents}
                  color="blue"
                />
              ))
            }
          </div>
        </ChartCard>

        {/* Responsáveis Mais Ativos */}
        <ChartCard title="Responsáveis Mais Ativos">
          <div className="space-y-3">
            {analytics.topResponsaveis.map(([responsavel, count]) => (
              <ProgressBar
                key={responsavel}
                label={responsavel}
                value={count}
                total={analytics.totalEvents}
                color="purple"
              />
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Estatísticas Adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Métricas de Performance */}
        <ChartCard title="Métricas de Performance">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Taxa de Conclusão</span>
              </div>
              <span className="text-lg font-bold text-blue-600">
                {Math.round(analytics.completionRate)}%
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Duração Média</span>
              </div>
              <span className="text-lg font-bold text-green-600">
                {analytics.averageDurationHours.toFixed(1)}h
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium">Cancelamentos</span>
              </div>
              <span className="text-lg font-bold text-red-600">
                {analytics.cancelledEvents}
              </span>
            </div>
          </div>
        </ChartCard>

        {/* Eventos com Mais Participantes */}
        <ChartCard title="Eventos com Mais Participantes">
          <div className="space-y-3">
            {analytics.topEventsByParticipants.length > 0 ? (
              analytics.topEventsByParticipants.map((event, index) => (
                <div key={event.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.title || event.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-900">
                      {event.participants.length}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhum evento com participantes registrados
              </p>
            )}
          </div>
        </ChartCard>

        {/* Distribuição por Mês */}
        <ChartCard title="Distribuição por Mês">
          <div className="space-y-3">
            {Object.entries(analytics.byMonth)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([month, count]) => (
                <ProgressBar
                  key={month}
                  label={month}
                  value={count}
                  total={analytics.totalEvents}
                  color="indigo"
                />
              ))
            }
          </div>
        </ChartCard>
      </div>

      {/* Insights e Recomendações */}
      <ChartCard title="Insights e Recomendações" className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              Pontos de Atenção
            </h4>
            
            {analytics.completionRate < 80 && (
              <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Taxa de conclusão baixa ({Math.round(analytics.completionRate)}%). 
                  Considere revisar o planejamento dos eventos.
                </p>
              </div>
            )}

            {analytics.cancelledEvents > analytics.totalEvents * 0.1 && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-sm text-red-800">
                  Alto número de cancelamentos ({analytics.cancelledEvents}). 
                  Revise os fatores que podem estar causando isso.
                </p>
              </div>
            )}

            {analytics.averageDurationHours > 3 && (
              <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg">
                <p className="text-sm text-blue-800">
                  Eventos com duração média alta ({analytics.averageDurationHours.toFixed(1)}h). 
                  Considere dividir em sessões menores.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Target className="w-4 h-4 mr-2 text-green-500" />
              Oportunidades
            </h4>

            {analytics.totalParticipants > 0 && (
              <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-sm text-green-800">
                  Bom engajamento com {analytics.totalParticipants} participantes. 
                  Continue promovendo a participação ativa.
                </p>
              </div>
            )}

            {Object.keys(analytics.byCategory).length > 3 && (
              <div className="p-3 bg-purple-100 border border-purple-300 rounded-lg">
                <p className="text-sm text-purple-800">
                  Boa diversidade de categorias ({Object.keys(analytics.byCategory).length}). 
                  Isso demonstra uma programação variada.
                </p>
              </div>
            )}

            {analytics.upcomingEvents > 5 && (
              <div className="p-3 bg-indigo-100 border border-indigo-300 rounded-lg">
                <p className="text-sm text-indigo-800">
                  Agenda bem planejada com {analytics.upcomingEvents} eventos futuros. 
                  Mantenha o ritmo de planejamento.
                </p>
              </div>
            )}
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

export default CronogramaAnalytics;
