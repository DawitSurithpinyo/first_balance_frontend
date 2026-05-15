import './navBar.css'

export default function NavBar() {
    return (
        <ul>
            <li><a href='/dashboard'>Dashboard</a></li>
            <li><a href='/entries'>Entries</a></li>
            <li><a href='/setting'>Account</a></li>
        </ul>
    )
}