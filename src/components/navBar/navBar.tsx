import './navBar.css'
import { Link } from 'react-router'

export default function NavBar() {
    return (
        <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/entries">Entries</Link></li>
            <li><Link to="/setting">Setting</Link></li>
        </ul>
    )
}