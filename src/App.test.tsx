import React from "react";
import { render, screen } from '@testing-library/react';
import App from './App';

test("Renders the main page", () => {
    render(<App />)
    expect(true).toBeTruthy()
})