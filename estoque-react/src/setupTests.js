// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// setupTests.js
// import { createCanvas } from 'canvas';

// Mock do HTMLCanvasElement
global.HTMLCanvasElement.prototype.getContext = () => {
    return {
        drawImage: jest.fn(),
        fillRect: jest.fn(),
        // Adicione outros métodos que você precisa mockar
    };
};

