// components/CheckboxDropdown.tsx
// Author: Navy

type CheckboxDropdownProps = {
    label: string;
    options: string[];
    selected: string[];
    setSelected: React.Dispatch<React.SetStateAction<string[]>>;
    isOpen: boolean;
    toggleOpen: () => void;
};

export default function CheckboxDropdown({label, options, selected, setSelected, isOpen, toggleOpen,}: CheckboxDropdownProps) {
    const toggleOption = (value: string) => {
        setSelected((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);
    };

    return (
        <div className="relative inline-block text-sm">
            <button onClick={toggleOpen} className="link-hover px-3 py-1 rounded">
                {label}
            </button>
            <div className={`absolute bg-theme-primary border border-theme-accent rounded p-2 mt-1 z-50 shadow-lg transition-all duration-200 ease-out transform origin-top ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                {options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                        <input type="checkbox" checked={selected.includes(option)} onChange={() => toggleOption(option)} className="mr-1 accent-[#3a4a5a]" />
                        <label htmlFor={option} className="whitespace-nowrap">{option}</label>
                    </div>
                ))}
            </div>
        </div>
    );
}