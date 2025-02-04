import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Flame, FileText, Folder } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

// Configuration for excluding files and folders
const EXCLUDED_ITEMS = [
  '.github', '.vscode', 'node_modules', 'public', 'src', 'docs', 'dist',
  'package.json', 'package-lock.json', 'tailwind.config.js', 'postcss.config.js',
  'vite.config.js', '.gitignore', 'index.html'
];

const DirectoryItem = ({ name, content, onSelect, selectedPath }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDirectory = content.type === 'directory';
  const isSelected = selectedPath === name;

  return (
    <div className="mb-1">
      <div 
        className={`flex items-center p-2 rounded cursor-pointer hover:bg-gray-700 ${
          isSelected ? 'bg-gray-700' : ''
        }`}
        onClick={() => {
          if (isDirectory) {
            setIsOpen(!isOpen);
          }
          onSelect(name, isDirectory);
        }}
      >
        {isDirectory ? (
          <>
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-400 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
            )}
            <Folder className="w-4 h-4 text-yellow-500 mr-2" />
          </>
        ) : (
          <FileText className="w-4 h-4 text-blue-400 ml-6 mr-2" />
        )}
        <span className="text-gray-200">{name}</span>
      </div>
      
      {isDirectory && isOpen && (
        <div className="ml-4">
          {Object.entries(content.items || {}).map(([itemName, itemContent]) => (
            <DirectoryItem
              key={`${name}/${itemName}`}
              name={`${name}/${itemName}`}
              content={itemContent}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [selectedPath, setSelectedPath] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [repoStructure, setRepoStructure] = useState(null);
  const [isLoadingStructure, setIsLoadingStructure] = useState(true);
  const [error, setError] = useState(null);

  const fetchFileContent = async (path) => {
    setIsLoading(true);
    try {
      const rawUrl = `https://raw.githubusercontent.com/letswastetimee/HEARTH/gh-pages/${path}`;
      console.log('Fetching file from:', rawUrl);
      const response = await fetch(rawUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const text = await response.text();
      setFileContent(text);
      setIsMarkdown(path.toLowerCase().endsWith('.md')); // Ensure all Markdown files are processed properly
    } catch (error) {
      console.error('Error fetching file:', error);
      setFileContent('Error loading file content');
    }
    setIsLoading(false);
  };

  const fetchRepoContent = async (path = '') => {
    try {
      const apiUrl = `https://api.github.com/repos/letswastetimee/HEARTH/contents/${path}?ref=gh-pages`;
      console.log('Fetching repo content from:', apiUrl);
      
      const response = await fetch(apiUrl, { headers: { 'Accept': 'application/vnd.github.v3+json' } });
      if (!response.ok) throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching repo structure:', error);
      setError(error.message);
      return [];
    }
  };

  const buildRepoStructure = async () => {
    console.log('Building repo structure');
    setIsLoadingStructure(true);
    setError(null);
    try {
      const rootContent = await fetchRepoContent('');
      if (!rootContent || rootContent.length === 0) throw new Error('No content received');

      const structure = {};
      for (const item of rootContent) {
        if (EXCLUDED_ITEMS.includes(item.name)) continue;

        if (item.type === 'dir') {
          const dirContent = await fetchRepoContent(item.path);
          structure[item.name] = { type: 'directory', items: {} };
          
          for (const dirItem of dirContent) {
            if (!EXCLUDED_ITEMS.includes(dirItem.name)) {
              structure[item.name].items[dirItem.name] = {
                type: dirItem.type === 'dir' ? 'directory' : 'file',
                path: dirItem.path
              };
            }
          }
        } else {
          structure[item.name] = { type: 'file', path: item.path };
        }
      }
      
      setRepoStructure(structure);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setRepoStructure(null);
    }
    setIsLoadingStructure(false);
  };

  useEffect(() => {
    buildRepoStructure();
  }, []);

  const handleSelect = async (path, isDirectory) => {
    console.log('Selected path:', path);
    setSelectedPath(path);

    if (isDirectory) {
      const dirContent = await fetchRepoContent(path);
      const hasReadme = dirContent.some(file => file.name.toLowerCase() === 'readme.md');

      if (hasReadme) {
        await fetchFileContent(`${path}/README.md`);
      } else {
        // If no README.md, show directory structure
        setFileContent(`📂 **Directory:** ${path}\n\n${dirContent.map(file => `- ${file.name}`).join('\n')}`);
        setIsMarkdown(true); // Render as Markdown to keep formatting
      }
    } else {
      await fetchFileContent(path);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex items-center">
          <Flame className="w-8 h-8 text-orange-500 mr-3" />
          <h1 className="text-2xl font-bold">HEARTH</h1>
        </div>
      </header>

      <div className="container mx-auto mt-8 flex">
        <div className="w-1/3 pr-6 border-r border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Repository Contents</h2>
          {Object.entries(repoStructure || {}).map(([name, content]) => (
            <DirectoryItem key={name} name={name} content={content} onSelect={handleSelect} selectedPath={selectedPath} />
          ))}
        </div>

        <div className="w-2/3 pl-6">
          <h2 className="text-xl font-semibold mb-4">{selectedPath || 'Select a file or folder'}</h2>
          <div className="prose prose-invert max-w-full">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
              {fileContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
