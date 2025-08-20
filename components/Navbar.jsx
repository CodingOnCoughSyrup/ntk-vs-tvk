import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full flex justify-center py-4">
      <div className="tile flex gap-3">
        <Link className="px-3 py-1 rounded-lg hover:opacity-90" href="/">Home</Link>
        <Link className="px-3 py-1 rounded-lg hover:opacity-90" href="/issues">Issues Addressed</Link>
        <Link className="px-3 py-1 rounded-lg hover:opacity-90" href="/protests">Protest & People Meet</Link>
        <Link className="px-3 py-1 rounded-lg hover:opacity-90" href="/press-meets">Press Meets</Link>
        <Link className="px-3 py-1 rounded-lg hover:opacity-90" href="/conferences">Conferences</Link>
      </div>
    </nav>
  );
}
