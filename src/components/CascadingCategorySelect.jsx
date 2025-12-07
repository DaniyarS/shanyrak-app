import { useState, useEffect, useRef } from 'react';
import './CascadingCategorySelect.css';

/**
 * CascadingCategorySelect Component
 * Displays categories in a hierarchical, expandable structure
 * Only leaf categories can be selected
 */
const CascadingCategorySelect = ({
  label,
  categories = [],
  value,
  onChange,
  error,
  required,
  placeholder = 'Select category',
  inputId,
  className = '',
  disabled = false,
  allowClear = false,
  clearLabel = 'All Categories',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(categories);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [selectedPath, setSelectedPath] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find selected category path on mount or when value changes
  useEffect(() => {
    if (value && categories.length > 0) {
      const path = findCategoryPath(categories, value);
      if (path) {
        setSelectedPath(path.map(cat => cat.name).join(' > '));
      }
    } else {
      setSelectedPath('');
    }
  }, [value, categories]);

  // Recursively find the path to a category by id
  const findCategoryPath = (cats, targetId, path = []) => {
    for (const cat of cats) {
      const newPath = [...path, cat];

      if (cat.id === targetId) {
        return newPath;
      }

      if (cat.children && cat.children.length > 0) {
        const found = findCategoryPath(cat.children, targetId, newPath);
        if (found) return found;
      }
    }
    return null;
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset to root level when opening
      setCurrentLevel(categories);
      setBreadcrumb([]);
    }
  };

  // Helper function to check if category is a leaf (has no children)
  const isLeafCategory = (category) => {
    // Handle both domain entities and plain objects
    if (typeof category.isLeafCategory === 'function') {
      return category.isLeafCategory();
    }
    // For plain objects, check if children is null, empty array, or undefined
    return !category.children || category.children.length === 0;
  };

  const handleCategoryClick = (category) => {
    if (isLeafCategory(category)) {
      // Leaf category - select it
      // Use category.id which contains the normalized publicId from the mapper
      const categoryId = category.id;
      const eventObject = {
        target: {
          name: 'categoryId',
          value: categoryId,
        },
      };
      onChange(eventObject);
      setSelectedPath(category.name);
      setIsOpen(false);
      setCurrentLevel(categories);
      setBreadcrumb([]);
    } else {
      // Parent category - expand to show children
      setBreadcrumb([...breadcrumb, category]);
      setCurrentLevel(category.children);
    }
  };

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      // Go back to root
      setCurrentLevel(categories);
      setBreadcrumb([]);
    } else {
      // Go back to specific level
      const newBreadcrumb = breadcrumb.slice(0, index + 1);
      setBreadcrumb(newBreadcrumb);
      setCurrentLevel(breadcrumb[index].children);
    }
  };

  const handleClearSelection = () => {
    const eventObject = {
      target: {
        name: 'categoryId',
        value: '',
      },
    };
    onChange(eventObject);
    setSelectedPath('');
    setIsOpen(false);
    setCurrentLevel(categories);
    setBreadcrumb([]);
  };

  return (
    <div className={`cascading-category-select ${className}`} ref={dropdownRef}>
      {label && (
        <label htmlFor={inputId || "cascading-category-input"} className="cascading-category-label">
          {label}
          {required && <span className="required-asterisk"> *</span>}
        </label>
      )}

      <div
        id={inputId || "cascading-category-input"}
        className={`cascading-category-input ${error ? 'error' : ''} ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleToggle}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={0}
      >
        <span className={selectedPath ? 'selected-value' : 'placeholder'}>
          {selectedPath || placeholder}
        </span>
        <svg
          className="dropdown-arrow"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {error && <div className="cascading-category-error">{error}</div>}

      {isOpen && (
        <div className="cascading-category-dropdown">
          {/* Breadcrumb navigation */}
          {breadcrumb.length > 0 && (
            <div className="category-breadcrumb">
              <button
                type="button"
                className="breadcrumb-item"
                onClick={() => handleBreadcrumbClick(-1)}
              >
                ← All Categories
              </button>
              {breadcrumb.map((crumb, index) => (
                <span key={`${crumb.id}-${index}`}>
                  <span className="breadcrumb-separator">/</span>
                  <button
                    type="button"
                    className="breadcrumb-item"
                    onClick={() => handleBreadcrumbClick(index)}
                  >
                    {crumb.name}
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Category list */}
          <div className="category-list">
            {/* Show "All Categories" option at root level when allowClear is enabled */}
            {allowClear && breadcrumb.length === 0 && (
              <div
                className="category-item leaf clear-option"
                onClick={handleClearSelection}
              >
                <span className="category-name">{clearLabel}</span>
              </div>
            )}
            
            {currentLevel.map((category, index) => {
              // Determine additional classes for builder categories
              let additionalClasses = '';
              if (category.isBuilderSection) {
                additionalClasses = 'builder-section';
              } else if (category.isBuilderCategory) {
                additionalClasses = 'builder-category';
              }

              return (
                <div
                  key={category.id || `category-${index}`}
                  className={`category-item ${isLeafCategory(category) ? 'leaf' : 'parent'} ${additionalClasses}`.trim()}
                  onClick={() => handleCategoryClick(category)}
                >
                  <span className="category-name">{category.name}</span>
                  {!isLeafCategory(category) && (
                    <span className="category-arrow">→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CascadingCategorySelect;
