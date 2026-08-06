export default function RoleSelection({ onSelectRole }) {
    return (
        <section
            className="role-selection"
            aria-labelledby="role-selection-heading"
        >
            <h1 id="role-selection-heading">
                Fire Warden Location Management
            </h1>

            <div className="role-selection__options">
                <button
                    type="button"
                    className="role-card"
                    onClick={() => onSelectRole('warden')}
                >
                    <span className="role-card__title">
                        Fire Warden
                    </span>

                    <span className="role-card__description">
                        Sign In, Record Location, or Update Details
                    </span>
                </button>

                <button
                    type="button"
                    className="role-card"
                    onClick={() => onSelectRole('health-and-safety')}
                >
                    <span className="role-card__title">
                        Health &amp; Safety
                    </span>

                    <span className="role-card__description">
                        View all Attended and Unattended Locations
                    </span>
                </button>
            </div>
        </section>
    );
}