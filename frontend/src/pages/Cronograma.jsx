import React from 'react';
import CronogramaSimplified from '../components/CronogramaSimplified';

const Cronograma = () => {
  return <CronogramaSimplified />;
};
  // Estado para entradas de horário carregadas do backend
  const [entries, setEntries] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  // Data para entrada única
  const [date, setDate] = useState(() => new Date().toISOString().slice(0,10));
  // Várias datas para adicionar múltiplas entradas (campo oculto)
  const [multipleDates, setMultipleDates] = useState('');
  // Toggle para exibir campo de múltiplas datas
  const [showMultiple, setShowMultiple] = useState(false);
  // Dias de recorrência (Seg, Ter, Qua, Qui, Sex, Sab, Dom)
  const [recurrenceDays, setRecurrenceDays] = useState([]);
  // Toggle para abrir/fechar formulário em modal
  const [showForm, setShowForm] = useState(false);
  // Estado para edição de entrada existente
  const [editingEntry, setEditingEntry] = useState(null);
  const [actionEntry, setActionEntry] = useState(null); // Estado para ação do card
  const [deleteSeriesEntry, setDeleteSeriesEntry] = useState(null); // Estado para confirmação de exclusão em série
  // Data selecionada para visualização diária
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0,10));
  // Função para navegar dias
  const navigateDay = delta => {
    const dt = new Date(selectedDate);
    dt.setDate(dt.getDate() + delta);
    setSelectedDate(dt.toISOString().slice(0,10));
  };

  // Buscar eventos do calendário no backend ao iniciar
  useEffect(() => {
    const fetchCalendarEvents = async () => {
      console.log('fetchCalendarEvents effect iniciado');
      try {
        const response = await fetch('http://localhost:3005/api/eventos', { mode: 'cors' });
        if (response.ok) {
          const events = await response.json();
          console.log('Eventos recebidos do backend:', events);
          // Mapear eventos do backend para o formato interno
          const calendarEntries = events.map(ev => {
            const start = new Date(ev.dataInicio);
            const end = new Date(ev.dataFim);
            return {
              id: ev.id,
              date: start.toISOString().slice(0,10),
              startTime: start.toTimeString().slice(0,5),
              endTime: end.toTimeString().slice(0,5),
              description: ev.titulo,
              recurrenceDays: []
            };
          });
          console.log('Entradas mapeadas:', calendarEntries);
          // Filtra eventos do backend para o dia selecionado
          const backendDayEvents = calendarEntries.filter(e => e.date === selectedDate);
          
          // Carrega eventos do calendário local (localStorage)
          let calendarLocalEvents = [];
          try {
            const savedCalendar = JSON.parse(localStorage.getItem('calendarEvents') || '{}');
            const dayArrCalendar = savedCalendar[selectedDate] || [];
            calendarLocalEvents = dayArrCalendar.map((ev, idx) => ({
              id: `calendar-${selectedDate}-${idx}`,
              date: ev.date,
              startTime: ev.time || '',
              endTime: ev.endTime || '',
              description: ev.title,
              recurrenceDays: [],
              source: 'calendar'
            }));
          } catch { /* ignorar se erro */ }

          // Carrega eventos do cronograma local (localStorage)
          let cronogramaLocalEvents = [];
          try {
            const savedCronograma = JSON.parse(localStorage.getItem('cronogramaEvents') || '{}');
            const dayArrCronograma = savedCronograma[selectedDate] || [];
            cronogramaLocalEvents = dayArrCronograma.map((ev, idx) => ({
              id: `cronograma-${selectedDate}-${idx}`,
              date: ev.date,
              startTime: ev.time || '',
              endTime: ev.endTime || '',
              description: ev.title,
              recurrenceDays: ev.recurrenceDays || [],
              source: 'cronograma'
            }));
          } catch { /* ignorar se erro */ }

          // Combina eventos do backend, calendário e cronograma
          setEntries([...backendDayEvents, ...calendarLocalEvents, ...cronogramaLocalEvents]);
        } else {
          console.error('Falha ao buscar eventos:', response.statusText);
        }
      } catch (error) {
        console.error('Erro ao carregar eventos do calendário:', error);
      }
    };
    fetchCalendarEvents();
  }, [selectedDate]);

  // Adiciona entrada única (sem data)
  const addSingleEntry = () => {
    const newEntry = { id: Date.now(), date, startTime, endTime, description, recurrenceDays };
    // Salvar no banco de dados
    (async () => {
      try {
        await fetch('http://localhost:3005/api/eventos/cronograma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: description,
            dataInicio: `${date}T${startTime}:00`,
            dataFim: `${date}T${endTime}:00`,
            recorrencia: recurrenceDays.join(','),
          })
        });
      } catch (err) {
        console.error('Erro ao salvar no backend:', err);
      }
    })();
    // Salvar no localStorage do cronograma (separado do calendário)
    try {
      const savedCronograma = JSON.parse(localStorage.getItem('cronogramaEvents') || '{}');
      if (!savedCronograma[date]) savedCronograma[date] = [];
      savedCronograma[date].push({
        date,
        time: startTime,
        endTime,
        title: description,
        recurrenceDays
      });
      localStorage.setItem('cronogramaEvents', JSON.stringify(savedCronograma));
    } catch (err) {
      console.error('Erro ao salvar no localStorage:', err);
    }
    setEntries(prev => [...prev, newEntry]);
  };
  // Adiciona série de recorrência por 6 meses
  const addSeries = () => {
    const seriesId = Date.now();
    const mapDay = { Dom:0, Seg:1, Ter:2, Qua:3, Qui:4, Sex:5, Sab:6 };
    const today = new Date();
    const endDate = new Date(); endDate.setMonth(endDate.getMonth()+6);
    const occurrences = [];
    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate()+1)) {
      const key = Object.keys(mapDay).find(k => mapDay[k] === d.getDay());
      if (recurrenceDays.includes(key)) {
        const isoDate = d.toISOString().slice(0,10);
        const occ = { id: seriesId + d.getTime(), startTime, endTime, description, date: isoDate, recurrenceDays, seriesId };
        occurrences.push(occ);
        // Salvar no banco de dados
        (async () => {
          try {
            await fetch('http://localhost:3005/api/eventos/cronograma', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                titulo: description,
                dataInicio: `${isoDate}T${startTime}:00`,
                dataFim: `${isoDate}T${endTime}:00`,
                recorrencia: recurrenceDays.join(','),
              })
            });
          } catch (err) {
            console.error('Erro ao salvar recorrente no backend:', err);
          }
        })();
        // Salvar no localStorage do cronograma
        try {
          const savedCronograma = JSON.parse(localStorage.getItem('cronogramaEvents') || '{}');
          if (!savedCronograma[isoDate]) savedCronograma[isoDate] = [];
          savedCronograma[isoDate].push({
            date: isoDate,
            time: startTime,
            endTime,
            title: description,
            recurrenceDays
          });
          localStorage.setItem('cronogramaEvents', JSON.stringify(savedCronograma));
        } catch (err) {
          console.error('Erro ao salvar recorrente no localStorage:', err);
        }
      }
    }
    setEntries(prev => [...prev, ...occurrences]);
    // Limpa campos e fecha o formulário apos series
    setStartTime(''); setEndTime(''); setDescription(''); setRecurrenceDays([]); setShowForm(false);
  };
  // Ponto de entrada para adicionar ou salvar edição
  const addEntry = () => {
    if (!startTime || !endTime || !description) return;
    if (editingEntry) {
      // salvar edição
      const updated = { ...editingEntry, date, startTime, endTime, description, recurrenceDays };
      setEntries(prev => prev.map(e => e.id === editingEntry.id ? updated : e));
      setEditingEntry(null);
    } else if (showMultiple) {
      addMultipleEntries();
    } else if (recurrenceDays.length > 0) {
      addSeries();
    } else {
      addSingleEntry();
    }
    // Limpa campos
    setStartTime(''); setEndTime(''); setDescription(''); setRecurrenceDays([]); setMultipleDates(''); setShowMultiple(false); setShowForm(false);
  };
  // Adicionar entrada para múltiplas datas
  const addMultipleEntries = () => {
    if (!startTime || !endTime || !description || !multipleDates) return;
    const dates = multipleDates.split(',').map(d => d.trim()).filter(Boolean);
    const newEntriesArr = dates.map(dateStr => {
      const isoDate = toDate(dateStr).toISOString().slice(0,10);
      return { id: Date.now() + Math.random(), startTime, endTime, description, date: isoDate, recurrenceDays };
    });
    setEntries(prev => [...prev, ...newEntriesArr]);
    // Limpa campos e fecha o formulário
    setStartTime(''); setEndTime(''); setDescription(''); setRecurrenceDays([]); setMultipleDates(''); setShowMultiple(false); setShowForm(false);
  };
  // Excluir com opções para série recorrente
  const handleDelete = entry => {
    if (entry.seriesId) {
      const opt = window.prompt('Excluir: 1=Somente esta data, 2=Toda série, 3=A partir desta data');
      if (opt === '1') {
        setEntries(prev => prev.filter(e => e.id !== entry.id));
      } else if (opt === '2') {
        setEntries(prev => prev.filter(e => e.seriesId !== entry.seriesId));
      } else if (opt === '3') {
        setEntries(prev => prev.filter(e => !(e.seriesId === entry.seriesId && toDate(e.date) >= toDate(entry.date))));
      }
    } else {
      setEntries(prev => prev.filter(e => e.id !== entry.id));
    }
  };
  // Seleciona bloco de evento para editar ou excluir (antes com prompt)
  const handleCardClick = entry => {
    setActionEntry(entry);
  };

  // Auxiliar converte 'DD/MM/YYYY' em Date
  const toDate = str => {
    const [d,m,y] = str.split('/'); return new Date(`${y}-${m}-${d}`);
  };
  // Entradas apenas para o dia selecionado
  const dayEntries = entries.filter(e => e.date === selectedDate);
  // Configuração da grade horária (01:00 até 00:00)
  const startHour = 1;
  const endHour = 24;
  const hourCount = endHour - startHour;
  const pxPerMinute = 1; // 1px por minuto => 60px por hora
  const timelineRef = useRef(null);
  // calcular posição do horário atual
  const now = new Date();
  const todayISO = now.toISOString().slice(0,10);
  const currentTop = ((now.getHours() - startHour) * 60 + now.getMinutes()) * pxPerMinute;
  const minEventHeight = 20; // altura mínima em px para eventos curtos
  const currentTimeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  // Scroll automático para horário atual se data selecionada for hoje
  useEffect(() => {
    if (timelineRef.current && selectedDate === todayISO) {
      const scrollPos = Math.max(currentTop - 200, 0);
      timelineRef.current.scrollTo({ top: scrollPos, behavior: 'smooth' });
    }
  }, [selectedDate, todayISO, currentTop]);

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      {/* Botão para abrir modal de cadastro */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-emerald-900">Cronograma</h2>
        <button onClick={() => setShowForm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-md transition-colors">Adicionar Horário</button>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold text-secondary-900">{editingEntry ? 'Editar Horário' : 'Adicionar Horário'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Formulário de cadastro movido para modal */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-sm text-secondary-700">Início</label>
                  <input type="time" className="form-input w-full" value={startTime} onChange={e => setStartTime(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-secondary-700">Fim</label>
                  <input type="time" className="form-input w-full" value={endTime} onChange={e => setEndTime(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-secondary-700">Descrição</label>
                  <input type="text" className="form-input w-full" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Reunião administrativa" />
                </div>
                {/* Data para entrada única */}
                <div className="sm:col-span-4">
                  <label className="text-sm text-secondary-700">Data</label>
                  <input
                    type="date"
                    className="form-input w-full"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>
                {/* Recorrência dias */}
                <div className="sm:col-span-4">
                  <label className="text-sm text-secondary-700">Recorrência</label>
                  <div className="mt-1 grid grid-cols-7 gap-1">
                    {['Seg','Ter','Qua','Qui','Sex','Sab','Dom'].map(day => (
                      <button key={day} type="button"
                        onClick={() => setRecurrenceDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}
                        className={`py-1 text-xs rounded ${recurrenceDays.includes(day) ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-700'}`}
                      >{day}</button>
                    ))}
                  </div>
                </div>
                <div className="sm:col-span-4 flex justify-end space-x-2">
                  <button onClick={addEntry} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold mt-2 px-6 py-2 rounded-md transition-colors">{editingEntry ? 'Salvar' : 'Adicionar Horário'}</button>
                  <button
                    type="button"
                    onClick={() => setShowMultiple(prev => !prev)}
                    className="mt-2 px-4 py-2 flex items-center space-x-1 text-secondary-700 border border-secondary-300 rounded-lg hover:bg-secondary-100 transition-colors"
                  >
                    {showMultiple ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                    <span>Avançado</span>
                  </button>
                </div>
                {showMultiple && (
                  <div className="sm:col-span-4 col-span-1 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                    {/* Descrição da funcionalidade avançada */}
                    <p className="text-sm text-secondary-700 mb-2">
                      Ao usar esta opção, todas as datas listadas receberão automaticamente o horário de início e fim,
                      a descrição e os dias de recorrência selecionados acima.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700">Datas (DD/MM/YYYY)</label>
                      <div className="text-xs text-secondary-500 mb-2 space-y-1">
                        <p>Preencha primeiro Início, Fim e Descrição acima, depois insira as datas:</p>
                        <ul className="list-disc list-inside ml-4">
                          <li>
                            Início <code>08:00</code>, Fim <code>10:00</code>, Descrição “Reunião administrativa”, Datas: <code>23/07/2025, 24/07/2025</code>
                          </li>
                          <li>
                            Início <code>14:00</code>, Fim <code>15:30</code>, Descrição “Aula Bíblica”, Datas: <code>30/07/2025</code>
                          </li>
                        </ul>
                      </div>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={multipleDates}
                        onChange={e => setMultipleDates(e.target.value)}
                        placeholder="23/07/2025, 24/07/2025"
                      />
                    </div>
                    <div className="text-right">
                      <button
                        onClick={addMultipleEntries}
                        className="inline-flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2 rounded-md transition-colors"
                      >
                        Adicionar Múltiplas Datas
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agenda diária estilo Google Calendar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4 space-x-2">
          <h3 className="text-lg font-semibold text-emerald-900">Visão Diária</h3>
          <div className="flex items-center space-x-1">
            <button onClick={() => navigateDay(-1)} className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-5 h-5 text-secondary-700" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
            />
            <button onClick={() => navigateDay(1)} className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight className="w-5 h-5 text-secondary-700" />
            </button>
          </div>
        </div>
        <div className="relative overflow-y-auto" ref={timelineRef} style={{ height: (endHour - startHour) * 60 * pxPerMinute + 'px' }}>
          {/* Linha indicador de horário atual */}
          {selectedDate === todayISO && (
            <>
              <div
                className="absolute left-0 right-0 h-1 bg-emerald-600 z-20"
                style={{ top: currentTop + 'px' }}
              />
              <div
                className="absolute left-1/2 transform -translate-x-1/2 bg-white px-2 text-sm text-emerald-600 font-semibold z-20"
                style={{ top: (currentTop - 10) + 'px' }}
              >
                {currentTimeLabel}
              </div>
            </>
          )}
          {/* Linhas de horas e labels */}
          {[...Array(hourCount + 1)].map((_, idx) => {
            const rawHour = startHour + idx;
            const displayHour = rawHour === 24 ? '00' : String(rawHour).padStart(2, '0');
            const top = idx * 60 * pxPerMinute;
            return (
              <div
                key={rawHour}
                className="absolute left-0 right-0 border-t border-emerald-200 flex"
                style={{ top: top + 'px' }}
              >
                <span className="w-16 text-sm text-gray-600 px-1">{displayHour}:00</span>
                <div className="flex-1" />
              </div>
            );
          })}
          {/* Eventos do dia */}
          {/* Algoritmo para evitar sobreposição de eventos */}
          {(() => {
            // Agrupa eventos que colidem em grupos
            const groups = [];
            dayEntries.forEach((ev, idx) => {
              const [hS, mS] = ev.startTime.split(':').map(Number);
              const [hE, mE] = ev.endTime.split(':').map(Number);
              const startMin = (hS - startHour) * 60 + mS;
              const endMin = (hE - startHour) * 60 + mE;
              let found = false;
              for (const group of groups) {
                for (const gEv of group) {
                  const [gS, gM] = gEv.startTime.split(':').map(Number);
                  const [gE, gM2] = gEv.endTime.split(':').map(Number);
                  const gStart = (gS - startHour) * 60 + gM;
                  const gEnd = (gE - startHour) * 60 + gM2;
                  if (!(endMin <= gStart || startMin >= gEnd)) {
                    group.push(ev);
                    found = true;
                    break;
                  }
                }
                if (found) break;
              }
              if (!found) groups.push([ev]);
            });

            // Renderizar eventos lado a lado
            const positioned = [];
            groups.forEach(group => {
              const groupSize = group.length;
              const leftBase = 56; // px, para não cobrir os horários
              const minSpacing = 8; // px entre eventos
              const timelineWidth = timelineRef.current ? timelineRef.current.offsetWidth : 400;
              // Calcula largura máxima para cada evento
              const availableWidth = timelineWidth - leftBase - minSpacing * (groupSize - 1) - 16; // 16px de margem direita
              const eventWidthPx = Math.max(80, Math.floor(availableWidth / groupSize));
              group.forEach((ev, idx) => {
                const [hS, mS] = ev.startTime.split(':').map(Number);
                const [hE, mE] = ev.endTime.split(':').map(Number);
                const startMin = (hS - startHour) * 60 + mS;
                const endMin = (hE - startHour) * 60 + mE;
                const top = startMin * pxPerMinute;
                const rawHeight = (endMin - startMin) * pxPerMinute;
                const height = Math.max(rawHeight, minEventHeight);
                const left = leftBase + idx * (eventWidthPx + minSpacing);
                const isDuplicate = groupSize > 1;
                const bgColor = isDuplicate ? 'bg-yellow-200 border-yellow-500' : 'bg-emerald-50 border-emerald-600';
                positioned.push(
                  <div
                    key={ev.id}
                    onClick={() => handleCardClick(ev)}
                    className={`absolute ${bgColor} border-l-4 rounded-md p-2 shadow-sm hover:shadow-md transition-all cursor-pointer z-10`}
                    style={{
                      top: top + 'px',
                      height: height + 'px',
                      left: left + 'px',
                      width: eventWidthPx + 'px',
                      right: '4px'
                    }}
                  >
                    <div className="flex items-center justify-center h-full text-center">
                      <span className="text-lg font-medium italic font-serif text-emerald-800 truncate">{ev.description}</span>
                    </div>
                  </div>
                );
              });
            });
            return positioned;
          })()}
        </div>
      </div>
      {/* Modal de ação para Editar ou Excluir */}
      {actionEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <div className="flex justify-end">
              <button onClick={() => setActionEntry(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-4 text-center">O que deseja fazer?</p>
            <div className="flex justify-around">
              <button
                onClick={() => {
                  setEditingEntry(actionEntry);
                  setDate(actionEntry.date);
                  setStartTime(actionEntry.startTime);
                  setEndTime(actionEntry.endTime);
                  setDescription(actionEntry.description);
                  setRecurrenceDays(actionEntry.recurrenceDays || []);
                  setShowForm(true);
                  setActionEntry(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md"
              >Editar</button>
              <button
                onClick={() => {
                  // Abre modal de opções de exclusão para entradas recorrentes
                  setDeleteSeriesEntry(actionEntry);
                  setActionEntry(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >Excluir</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de exclusão em série */}
      {deleteSeriesEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <div className="flex justify-end">
              <button onClick={() => setDeleteSeriesEntry(null)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-4 text-center">Como deseja excluir?</p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setEntries(prev => prev.filter(e => e.id !== deleteSeriesEntry.id));
                  setDeleteSeriesEntry(null);
                }}
                className="w-full bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded-md"
              >Somente esta data</button>
              <button
                onClick={() => {
                  setEntries(prev => prev.filter(e => e.seriesId !== deleteSeriesEntry.seriesId));
                  setDeleteSeriesEntry(null);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >Toda série</button>
              <button
                onClick={() => {
                  setEntries(prev => prev.filter(e => !(e.seriesId === deleteSeriesEntry.seriesId && toDate(e.date) >= toDate(deleteSeriesEntry.date))));
                  setDeleteSeriesEntry(null);
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >A partir desta data</button>
            </div>
          </div>
        </div>
      )}
      {/* Fim do layout principal */}
    </div>
  );
};

export default Cronograma;
