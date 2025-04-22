import { Global, css } from '@emotion/react';

export const GlobalStyles = () => (
  <Global
    styles={css`
      :root {
        --radius: 0.5rem;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      
      /* Spinner animation */
      @keyframes antSpinMove {
        to {
          opacity: 1;
        }
      }

      .ant-spin-dot {
        position: relative;
        display: inline-block;
        width: 20px;
        height: 20px;
      }
      
      .ant-spin-dot-item {
        position: absolute;
        display: block;
        width: 9px;
        height: 9px;
        background-color: hsl(var(--primary));
        border-radius: 100%;
        transform: scale(0.75);
        transform-origin: 50% 50%;
        opacity: 0.3;
        animation: antSpinMove 1s infinite linear alternate;
      }
      
      .ant-spin-dot-item:nth-child(1) {
        top: 0;
        left: 0;
      }
      
      .ant-spin-dot-item:nth-child(2) {
        top: 0;
        right: 0;
        animation-delay: 0.4s;
      }
      
      .ant-spin-dot-item:nth-child(3) {
        right: 0;
        bottom: 0;
        animation-delay: 0.8s;
      }
      
      .ant-spin-dot-item:nth-child(4) {
        bottom: 0;
        left: 0;
        animation-delay: 1.2s;
      }

      /* Fade transition */
      .fade-enter {
        opacity: 0;
      }
      
      .fade-enter-active {
        opacity: 1;
        transition: opacity 300ms;
      }
      
      .fade-exit {
        opacity: 1;
      }
      
      .fade-exit-active {
        opacity: 0;
        transition: opacity 300ms;
      }
    `}
  />
);

export default GlobalStyles;
