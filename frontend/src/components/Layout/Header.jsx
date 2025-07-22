import React from 'react';
import { Menu, Bell, User, Settings } from 'lucide-react';

const getPageTitle = (path) => {
  const titles = {
    '/': 'Início',
    '/calendario': 'Calendário',
    '/batismos': 'Batismos',
    '/colaboradores': 'Colaboradores',
    '/escola-saudavel': 'Escola Saudável',
    '/alunos-adventistas': 'Alunos Adventistas',
    '/comunidades': 'Comunidades',
    '/eventos': 'Eventos',
    '/classes-biblicas': 'Classes Bíblicas',
    '/recoltas': 'Recoltas',
    '/relatorios': 'Relatórios',
    '/atendimentos-pastorais': 'Atendimentos Pastorais',
    '/planejamento-pastoral': 'Planejamento Pastoral',
  };
  
  return titles[path] || 'Pastoral Escolar';
};

const Header = ({ onMenuClick, currentPath }) => {
  const pageTitle = getPageTitle(currentPath);

  return (
    <header className="bg-white border-b border-secondary-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          {/* Menu button para mobile */}
          <button
            onClick={onMenuClick}
            className="p-2 text-secondary-500 hover:text-secondary-700 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Logo + Nome */}
          <div className="flex items-center gap-2">
            <img src="/logo-pastoral-escolar.png.png" alt="Logo Pastoral Escolar" className="h-10 w-auto" />
          </div>
          {/* Page Title */}
          <div className="ml-6">
            <h1 className="text-2xl font-semibold text-secondary-900">
              {pageTitle}
            </h1>
            <p className="text-sm text-secondary-500 mt-1">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-secondary-500 hover:text-secondary-700 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-secondary-500 hover:text-secondary-700">
            <Settings className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-secondary-900">
                Pastor João Silva
              </p>
              <p className="text-xs text-secondary-500">
                Administrador
              </p>
            </div>
            <button className="p-2 bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
