import React from "react";
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import userEventLib from '@testing-library/user-event';


interface MockHomeProps {
    navigateTo: (path: string) => void;
}
interface MockMainEditorProps {
    navigateTo: (path: string) => void;
}
interface MockLoginPageProps {
    navigateTo: (path: string) => void;
    onLoginSuccess: () => void;
}
interface MockRegisterPageProps {
    navigateTo: (path: string) => void;
    onRegisterSuccess: () => void;
}
interface MockHeaderProps {
    navigateTo: (path: string) => void;
    isLoggedIn?: boolean;
}

jest.mock('./pages/Home', () => ({ navigateTo }: MockHomeProps) => (
    <div data-testid="home-page">Home Page</div>
));
jest.mock('./pages/MainEditor', () => ({ navigateTo }: MockMainEditorProps) => (
    <div data-testid="editor-page">Editor Page</div>
));
jest.mock('./pages/LoginPage', () => ({ navigateTo, onLoginSuccess }: MockLoginPageProps) => (
    <div data-testid="login-page">
        Login Page
        <button onClick={() => navigateTo('/register')}>Go to Register</button>
        <button onClick={onLoginSuccess}>Simulate Login</button>
    </div>
));
jest.mock('./pages/RegisterPage', () => ({ navigateTo, onRegisterSuccess }: MockRegisterPageProps) => (
    <div data-testid="register-page">
        Register Page
        <button onClick={onRegisterSuccess}>Simulate Register</button>
    </div>
));
jest.mock('./components/Header', () => ({ navigateTo, isLoggedIn }: MockHeaderProps) => (
    <header data-testid="app-header">
        App Header - LoggedIn: {isLoggedIn ? 'Yes' : 'No'}
        <button onClick={() => navigateTo('/')}>Header Home</button>
        {!isLoggedIn && <button onClick={() => navigateTo('/login')}>Header Login</button>}
        {!isLoggedIn && <button onClick={() => navigateTo('/register')}>Header Register</button>}
        {isLoggedIn && <button onClick={() => navigateTo('/profile')}>Header Profile</button>}
    </header>
));

const user = userEventLib.setup();
describe('App Routing and Basic Navigation', () => {
    beforeEach(() => {        
        window.history.pushState({}, '', '/');
    });

    test('renders Home page by default and Header reflects not logged in', () => {
        render(<App />);
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(window.location.pathname).toBe('/');
        expect(screen.getByTestId('app-header')).toHaveTextContent('LoggedIn: No');
    });

    test('navigates to LoginPage when /login is accessed directly', () => {
        window.history.pushState({}, '', '/login');
        render(<App />);
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(window.location.pathname).toBe('/login');
    });

    test('navigates from Login page to Register page using button', async () => {
        window.history.pushState({}, '', '/login'); 
        render(<App />);
        const goToRegisterButton = screen.getByRole('button', { name: 'Go to Register' });
        await user.click(goToRegisterButton); 
        expect(screen.getByTestId('register-page')).toBeInTheDocument();
        expect(window.location.pathname).toBe('/register');
    });

    test('successful login navigates to editor page and updates header', async () => {
        window.history.pushState({}, '', '/login'); 
        render(<App />);
       
        const simulateLoginButton = screen.getByRole('button', { name: 'Simulate Login' });
        await user.click(simulateLoginButton); 
        expect(screen.getByTestId('editor-page')).toBeInTheDocument();
        expect(window.location.pathname).toBe('/editor');
        expect(screen.getByTestId('app-header')).toHaveTextContent('LoggedIn: Yes');
    });

    test('accessing /editor when not logged in redirects to /login', () => {
        window.history.pushState({}, '', '/editor');
        render(<App />);
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(window.location.pathname).toBe('/login');
        expect(screen.getByTestId('app-header')).toHaveTextContent('LoggedIn: No');
    });

    test('handles browser back/forward navigation (popstate)', async () => {
        render(<App />);
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        // Navega a /login usando un botón del header
        await user.click(screen.getByRole('button', { name: 'Header Login' }));
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(window.location.pathname).toBe('/login');

        // Simula el botón "atrás" del navegador
        act(() => {
            window.history.back(); // Esto debería disparar el evento 'popstate'
        });
        
        // Esperar a que el DOM se actualice después del evento popstate
        expect(await screen.findByTestId('home-page')).toBeInTheDocument();
        expect(window.location.pathname).toBe('/');
    });
    test('navigates to Home page and updates URL for unknown paths', () => {
        window.history.pushState({}, '', '/unknown-path');
        render(<App />);
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(window.location.pathname).toBe('/'); // App.tsx should replaceState to '/'
        expect(screen.getByTestId('app-header')).toHaveTextContent('LoggedIn: No');
    });

    test('successful registration navigates to login page', async () => {
        window.history.pushState({}, '', '/register'); // Start on register page
        render(<App />);
        const simulateRegisterButton = screen.getByRole('button', { name: 'Simulate Register' });
        await user.click(simulateRegisterButton); // userEvent.click ya está envuelto en act
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
        expect(window.location.pathname).toBe('/login');
    });

    test('navigates from Header to Register page when not logged in', async () => {
        render(<App />); // Starts at '/'
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(screen.getByTestId('app-header')).toHaveTextContent('LoggedIn: No');

        const headerRegisterButton = screen.getByRole('button', { name: 'Header Register' });
        await user.click(headerRegisterButton); // userEvent.click ya está envuelto en act
        
        expect(screen.getByTestId('register-page')).toBeInTheDocument();
        expect(window.location.pathname).toBe('/register');
    });

    test('navigates from Header to Profile (defaults to Home) when logged in', async () => {
        // First, log in
        window.history.pushState({}, '', '/login');
        render(<App />);
        const simulateLoginButton = screen.getByRole('button', { name: 'Simulate Login' });
        await user.click(simulateLoginButton); // userEvent.click ya está envuelto en act
        
        // Should be on editor page and logged in
        expect(screen.getByTestId('editor-page')).toBeInTheDocument();
        expect(window.location.pathname).toBe('/editor');
        expect(screen.getByTestId('app-header')).toHaveTextContent('LoggedIn: Yes');

        // Now click Header Profile button
        const headerProfileButton = screen.getByRole('button', { name: 'Header Profile' });
        await user.click(headerProfileButton); // userEvent.click ya está envuelto en act

        // App.tsx default case for routes will render Home and change path to '/'
        // because '/profile' is not an explicitly handled route.
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
        expect(window.location.pathname).toBe('/');
        expect(screen.getByTestId('app-header')).toHaveTextContent('LoggedIn: Yes'); // Still logged in
    });

});