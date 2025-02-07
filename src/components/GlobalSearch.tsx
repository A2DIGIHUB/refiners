import React, { useState } from 'react';
import { useCombobox } from 'downshift';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  type: 'page' | 'event' | 'sermon';
}

const mockSearchResults: SearchResult[] = [
  { id: '1', title: 'Sunday Service', url: '/events', type: 'event' },
  { id: '2', title: 'About Us', url: '/about', type: 'page' },
  { id: '3', title: 'Latest Sermon', url: '/sermons', type: 'sermon' },
];

export function GlobalSearch() {
  const [items, setItems] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items,
    onInputValueChange: ({ inputValue }) => {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setItems(
          mockSearchResults.filter((item) =>
            item.title.toLowerCase().includes(inputValue?.toLowerCase() ?? '')
          )
        );
        setIsLoading(false);
      }, 300);
    },
  });

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div {...getComboboxProps()}>
        <input
          {...getInputProps()}
          type="text"
          className="w-full px-4 py-2 rounded-lg border border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Search..."
          aria-label="Search"
        />
      </div>
      <ul
        {...getMenuProps()}
        className={`absolute z-10 w-full bg-white mt-1 rounded-lg shadow-lg ${
          isOpen && items.length > 0 ? '' : 'hidden'
        }`}
      >
        {isOpen &&
          items.map((item, index) => (
            <li
              key={item.id}
              {...getItemProps({ item, index })}
              className={`px-4 py-2 cursor-pointer ${
                highlightedIndex === index
                  ? 'bg-primary-100'
                  : 'hover:bg-primary-50'
              }`}
            >
              <a href={item.url} className="block">
                <span className="font-medium">{item.title}</span>
                <span className="ml-2 text-sm text-primary-500">
                  {item.type}
                </span>
              </a>
            </li>
          ))}
        {isLoading && (
          <li className="px-4 py-2 text-primary-500">Loading...</li>
        )}
      </ul>
    </div>
  );
}