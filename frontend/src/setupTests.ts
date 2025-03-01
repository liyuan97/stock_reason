// jest-dom 添加自定义的 jest 匹配器，用于断言 DOM 节点状态
// 允许做类似 expect(element).toHaveTextContent(/react/i) 的断言
// 更多详情: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// 模拟window.matchMedia - 为了修复Lightweight Charts的测试问题
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // 兼容旧API
    removeListener: jest.fn(), // 兼容旧API
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
