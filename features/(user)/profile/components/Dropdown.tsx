import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function Dropdown({
    label, open, onToggle, children,
}: { label: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
    return (
        <div className="border-b border-border last:border-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors"
            >
                {label}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        <div className="px-3 pb-3">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}