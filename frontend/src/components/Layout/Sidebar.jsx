import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Droplets, 
  Users, 
  Heart, 
  GraduationCap, 
  MapPin, 
  PartyPopper, 
  BookOpen, 
  DollarSign, 
  FileText, 
  UserCheck, 
  Clipboard,
  Clock,
  X
} from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Início', path: '/' },
  { icon: Calendar, label: 'Calendário', path: '/calendario' },
  { icon: Clock, label: 'Cronograma/horários', path: '/cronograma' },
  { icon: Droplets, label: 'Batismos', path: '/batismos' },
  { icon: Users, label: 'Colaboradores', path: '/colaboradores' },
  { icon: Heart, label: 'Escola Saudável', path: '/escola-saudavel' },
  { icon: GraduationCap, label: 'Alunos Adventistas', path: '/alunos-adventistas' },
  { icon: MapPin, label: 'Comunidades', path: '/comunidades' },
  { icon: PartyPopper, label: 'Eventos', path: '/eventos' },
  { icon: BookOpen, label: 'Classes Bíblicas', path: '/classes-biblicas' },
  { icon: DollarSign, label: 'Recoltas', path: '/recoltas' },
  { icon: FileText, label: 'Relatórios', path: '/relatorios' },
  { icon: UserCheck, label: 'Atendimentos Pastorais', path: '/atendimentos-pastorais' },
  { icon: Clipboard, label: 'Planejamento Pastoral', path: '/planejamento-pastoral' },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Sidebar fixo para desktop */}
      <div className={`
        fixed top-0 left-0 z-50 w-64 h-full bg-white border-r border-secondary-200 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header do Sidebar */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/logo-pastoral-escolar.png" alt="Logo Pastoral Escolar" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-secondary-900">
                Pastoral Escolar
              </h1>
            </div>
          </div>
          
          {/* Botão fechar (apenas mobile) */}
          <button
            onClick={onClose}
            className="p-1 text-secondary-500 hover:text-secondary-700 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu de Navegação */}
        <nav className="mt-6 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose} // Fechar sidebar no mobile ao clicar
                className={({ isActive }) => `
                  sidebar-link group
                  ${isActive ? 'active' : ''}
                `}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

                        <img src="/logo-pastoral-escolar.png" alt="Logo Pastoral Escolar" className="w-8 h-8 object-contain" />
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-200">
          <div className="text-xs text-secondary-500 text-center">
            <p>Sistema Pastoral Escolar</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
