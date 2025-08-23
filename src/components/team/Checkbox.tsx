
type CheckboxProps = {
    checked: boolean;
    label: string;
    disabled?: boolean;
    onChange: (value: boolean) => void;
};

export function Checkbox({ checked, label, disabled, onChange }: CheckboxProps) {
    return (
        <label className="flex items-center cursor-pointer select-none">
            <span className="text-sm font-medium text-theme-secondary opacity-80 overflow-hidden text-ellipsis whitespace-nowrap pr-4">{label}</span>
            <div className={`relative flex-shrink-0 ${disabled && 'opacity-60'}`}>
                <input type="checkbox" disabled={disabled} checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
                <div className={`w-11 h-6 rounded-full transition-colors ${disabled ? 'bg-slate-500' : checked ? 'bg-(--theme-selected)' : 'bg-(--theme-primary)'}`} />
                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
        </label>
    );
}
