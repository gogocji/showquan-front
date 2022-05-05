import styles from './index.module.scss';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coyWithoutShadows } from "react-syntax-highlighter/dist/cjs/styles/prism";

// darcula webstorm
// vscDarkPlus vscode暗色主题

interface IProps {
  textContent: string
  darkMode?: boolean; // markdown文本
}

// const them = {
//   dark: 'vscDarkPlus',
//   light: 'coyWithoutShadows'
// };

const MyMarkDown = (props: IProps) => {
  const { textContent, darkMode } = props;
  // if (typeof darkMode === 'undefined') {
  //   them.light = darcula;
  // }
  // if (typeof darkMode === 'boolean') {
  //   them.light = coyWithoutShadows;
  // }
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              showLineNumbers={true}
              language={match[1]}
              style={coyWithoutShadows}
              PreTag='div'
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {textContent}
    </ReactMarkdown>
  );
};

export default MyMarkDown;
