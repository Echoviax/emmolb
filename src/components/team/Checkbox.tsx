
type CheckboxProps = {
    checked: boolean;
    label: string;
    onChange: (value: boolean) => void;
};

export function Checkbox({ checked, label, onChange }: CheckboxProps) {
    return (
        <label className="flex items-center cursor-pointer select-none">
            <span className="text-sm font-medium text-theme-secondary opacity-80 overflow-hidden text-ellipsis whitespace-nowrap pr-4">{label}</span>
            <div className="relative flex-shrink-0">
                <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
                <div className={`w-11 h-6 rounded-full transition-colors ${checked ? 'bg-(--theme-selected)' : 'bg-(--theme-primary)'}`} />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
        </label>
    );
}
