import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 p-4 text-center text-xs text-gray-500 mt-auto">
      <p>RASMAL GROUP. Tous droits réservés © 2025.</p>
      <p>Document généré le {new Date().toLocaleDateString('fr-FR')}. Page 1 sur 1.</p>
    </footer>
  );
};

export default Footer;