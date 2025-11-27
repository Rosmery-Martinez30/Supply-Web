import React from 'react';
import NavbarLayout from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <NavbarLayout />
      <main>
        {children}
      </main>
    </>
  );
};

export default Layout;