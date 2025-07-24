import React, { useState } from 'react';
import { Menu, Bell, User, Settings, LogOut, HelpCircle } from 'lucide-react';
import NotificationCenter from '../NotificationCenter';

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
    '/cronograma': 'Cronograma',
  };
  
  return titles[path] || 'Pastoral Escolar';
};

const Header = ({ onMenuClick, currentPath }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pageTitle = getPageTitle(currentPath);

  return (
    <header className="bg-white border-b border-secondary-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          {/* Menu button para mobile */}
          <button
            onClick={onMenuClick}
            className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Logo + Nome */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div className="hidden sm:block">
              <h2 className="text-lg font-semibold text-secondary-900">Pastoral Escolar</h2>
              <p className="text-xs text-secondary-500">Sistema v1.1.0</p>
            </div>
          </div>
          
          {/* Page Title */}
          <div className="ml-6 hidden md:block">
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
        <div className="flex items-center space-x-2">
          {/* Centro de Notificações */}
          <NotificationCenter />

          {/* Help */}
          <button 
            className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
            title="Ajuda"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button 
            className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
            title="Configurações"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-secondary-900">
                  Pastor João Silva
                </p>
                <p className="text-xs text-secondary-500">
                  Administrador
                </p>
              </div>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200 transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            </div>

            {/* User Dropdown */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-3 border-b border-gray-200">
                    <p className="font-medium text-gray-900">Pastor João Silva</p>
                    <p className="text-sm text-gray-500">pastor@escola.com</p>
                  </div>
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Meu Perfil</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Configurações</span>
                    </button>
                    <hr className="my-1" />
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2">
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
