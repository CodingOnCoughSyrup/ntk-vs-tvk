import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle() {
    const { language, toggleLanguage } = useLanguage();

    return (
        <button
            className="tile fixed top-4 right-28 z-50 px-3 py-2 hover:opacity-90 font-bold"
            onClick={toggleLanguage}
            title="Switch Language"
        >
            {language === 'en' ? 'தமிழ்' : 'English'}
        </button>
    );
}
