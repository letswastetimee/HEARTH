import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Flame, FileText, Folder } from 'lucide-react';

// Sample repository structure - you'll need to replace this with your actual structure
const repoStructure = {
  Flames: {
    type: 'directory',
    items: {
      'README.md': { type: 'file' },
      'H0001.md': { type: 'file' },
      'H0002.md': { type: 'file' }
    }
  },
  Embers: {
    type: 'directory',
    items: {
      'README.md': { type: 'file' },
      'B0001.md': { type: 'file' }
    }
  },
  Alchemy: {
    type: 'directory',
    items: {
      'README.md': { type: 'file' },
      'A0001.md': { type: 'file' }
    }
  },
  Forge: {
    type: 'directory',
    items: {
      'README.md': { type: 'file' }
    }
  },
  'README.md': { type: 'file' }
};

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
          {Object.entries(content.items).map(([itemName, itemContent]) => (
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
            {Object.entries(repoStructure).map(([name, content]) => (
              <DirectoryItem
                key={name}
                name={name}
                content={content}
                onSelect={setSelectedPath}
                selectedPath={selectedPath}
              />
            ))}
          </div>
        </div>

        <div className="w-2/3 pl-6">
          {selectedPath ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">{selectedPath}</h2>
              <div className="bg-gray-800 rounded p-4">
                <p className="text-gray-400">File content would be displayed here</p>
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