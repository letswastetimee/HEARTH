import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Flame, FileText, Folder } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

// Configuration for excluding files and folders
const EXCLUDED_ITEMS = [
  '.github',
  '.vscode',
  'node_modules',
  'public',
  'src',
  'docs',
  'package.json',
  'package-lock.json',
  'tailwind.config.js',
  'postcss.config.js',
  'vite.config.js',
  '.gitignore',
  'index.html'
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
          onSelect(name);
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
          <>
            <FileText className="w-4 h-4 text-blue-400 ml-6 mr-2" />
          </>
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
      
      const headers = {
        'Accept': 'application/vnd.github.v3+json'
      };

      const response = await fetch(apiUrl, { headers });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('GitHub API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error details:', error);
      setError(error.message);
      return [];
    }
  };

  const buildRepoStructure = async () => {
    console.log('Starting to build repo structure');
    setIsLoadingStructure(true);
    setError(null);
    try {
      const rootContent = await fetchRepoContent('');
      if (!rootContent || rootContent.length === 0) {
        throw new Error('No content received from GitHub');
      }

      const structure = {};

      for (const item of rootContent) {
        // Skip excluded items
        if (EXCLUDED_ITEMS.includes(item.name)) {
          console.log('Skipping excluded item:', item.name);
          continue;
        }

        console.log('Processing item:', item.name);
        if (item.type === 'dir') {
          const dirContent = await fetchRepoContent(item.path);
          structure[item.name] = {
            type: 'directory',
            items: {}
          };
          
          // Filter out excluded items from directory content
          for (const dirItem of dirContent) {
            if (!EXCLUDED_ITEMS.includes(dirItem.name)) {
              structure[item.name].items[dirItem.name] = {
                type: dirItem.type === 'dir' ? 'directory' : 'file',
                path: dirItem.path
              };
            }
          }
        } else {
          structure[item.name] = {
            type: 'file',
            path: item.path
          };
        }
      }
      
      console.log('Final structure:', structure);
      setRepoStructure(structure);
    } catch (error) {
      console.error('Error building repo structure:', error);
      setError(error.message);
      setRepoStructure(null);
    }
    setIsLoadingStructure(false);
  };

  useEffect(() => {
    buildRepoStructure();
  }, []);

  const handleSelect = (path) => {
    console.log('Selected path:', path);
    setSelectedPath(path);
    if (path && !path.endsWith('/')) {
      fetchFileContent(path);
    } else {
      setFileContent('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex items-center">
          <Flame className="w-8 h-8 text-orange-500 mr-3" />
          <h1 className="text-2xl font-bold">HEARTH</h1>
          <span className="ml-4 text-gray-400">Hunting Exchange And Research Threat Hub</span>
        </div>
      </header>

      <div className="container mx-auto mt-8 flex">
        <div className="w-1/3 pr-6 border-r border-gray-700">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-4">Repository Contents</h2>
            {isLoadingStructure ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : error ? (
              <div className="text-gray-400 p-4 bg-gray-800 rounded">
                <p className="font-semibold text-red-400 mb-2">Error: {error}</p>
                <button 
                  onClick={buildRepoStructure}
                  className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                >
                  Retry
                </button>
              </div>
            ) : repoStructure ? (
              Object.entries(repoStructure).map(([name, content]) => (
                <DirectoryItem
                  key={name}
                  name={name}
                  content={content}
                  onSelect={handleSelect}
                  selectedPath={selectedPath}
                />
              ))
            ) : (
              <div className="text-gray-400 p-4 bg-gray-800 rounded">
                <p>No content available</p>
                <button 
                  onClick={buildRepoStructure}
                  className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="w-2/3 pl-6">
          {selectedPath ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">{selectedPath}</h2>
              <div className="bg-gray-800 rounded p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : selectedPath?.toLowerCase().endsWith('.md') ? (
                  <div className="prose prose-invert">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeSanitize]}
                      components={{
                        img: ({node, ...props}) => (
                          <img className="max-w-full h-auto" {...props} />
                        ),
                        a: ({node, ...props}) => (
                          <a className="text-blue-400 hover:text-blue-300" {...props} target="_blank" rel="noopener noreferrer" />
                        ),
                      }}
                    >
                      {fileContent}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <pre className="text-gray-200 whitespace-pre-wrap font-mono text-sm overflow-auto max-h-[calc(100vh-250px)]">
                    {fileContent}
                  </pre>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center mt-12">
              <Flame className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Welcome to HEARTH</h2>
              <p className="text-gray-400">Select a file from the repository to view its contents</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;