import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, Box, Zap, Users } from 'lucide-react';

const Inicio = () => {
  const { isAuthenticated, role, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowParticles(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const renderParticles = () => {
    if (!showParticles) return null;
    return Array.from({ length: 40 }).map((_, i) => {
      const size = Math.random() * 4 + 2;
      const style = {
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${Math.random() * 10 + 10}s`
      };
      const colors = ['particle-blue', 'particle-red', 'particle-dark'];
      const colorClass = colors[Math.floor(Math.random() * colors.length)];
      
      return <div key={i} className={`particle ${colorClass}`} style={style} />;
    });
  };

  return (
    <div className="landing-container">
      <div className="particles-wrapper">
        {renderParticles()}
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          <Zap size={14} className="badge-icon" />
          <span>{t('brand')} v2.0 is now live</span>
        </div>
        
        <h1 className="hero-title">
          {t('hero.title.1')} <br className="hero-break" /> 
          {t('hero.title.2')} <span className="text-gradient">{t('hero.title.span')}</span>
        </h1>
        
        <p className="hero-subtitle">
          {isAuthenticated 
            ? t('hero.subtitle.auth', { name: user?.nombre || role })
            : t('hero.subtitle.guest')}
        </p>
        
        <div className="hero-actions">
          {isAuthenticated ? (
            role === 'Administrador' ? null : (
              <>
                <button className="btn-dark-pill huge" onClick={() => navigate(role === 'Cliente' ? '/cliente/productos' : '/usuario/productos')}>
                  {t('hero.btn.catalog')}
                </button>
                <button className="btn-outline-pill huge" onClick={() => navigate(role === 'Cliente' ? '/cliente/pedidos' : '/usuario/pedidos')}>
                  {t('hero.btn.myOrders')} <ArrowRight size={18} />
                </button>
              </>
            )
          ) : (
            <>
              <button className="btn-dark-pill huge" onClick={() => navigate('/login')}>
                {t('hero.btn.start')}
              </button>
              <button className="btn-outline-pill huge" onClick={() => navigate('/usuario/productos')}>
                {t('hero.btn.explore')} <ArrowRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon"><Box size={24} /></div>
          <h3>{t('feature.1.title')}</h3>
          <p>{t('feature.1.desc')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><Users size={24} /></div>
          <h3>{t('feature.2.title')}</h3>
          <p>{t('feature.2.desc')}</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon"><Zap size={24} /></div>
          <h3>{t('feature.3.title')}</h3>
          <p>{t('feature.3.desc')}</p>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
