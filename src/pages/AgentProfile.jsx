import { createSignal, onMount } from "solid-js";
import { FiEdit2, FiMail, FiPhone, FiAward, FiMapPin, FiDollarSign, FiGlobe, FiSave, FiX } from 'solid-icons/fi';
import styles from "./AgentProfile.module.css";

function AgentProfile() {
  const defaultProfile = {
    agentId: "AGT001",
    name: "Jane Doe",
    email: "jane.doe@travelgpt.com",
    phone: "+1 (555) 123-4567",
    agency: "TravelGPT Luxury Division",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    specialties: ["Luxury Travel", "Honeymoon Packages", "Adventure Tours"],
    certifications: ["Certified Travel Associate", "Luxury Travel Specialist"],
    aboutMe: "With over 10 years of experience in luxury travel planning...",
    preferredCurrency: "USD",
    defaultMarkup: 10,
    languages: ["English", "French", "Spanish"],
    regions: ["Europe", "Caribbean", "Southeast Asia"],
    socialMedia: {
      linkedin: "jane-doe-travel",
      instagram: "@janedoetravels"
    }
  };

  const [agentProfile, setAgentProfile] = createSignal(defaultProfile);
  const [isEditing, setIsEditing] = createSignal(false);
  const [editedProfile, setEditedProfile] = createSignal({...defaultProfile});

  // Load profile from localStorage on mount
  onMount(() => {
    const savedProfile = localStorage.getItem('agentProfile');
    if (savedProfile) {
      setAgentProfile(JSON.parse(savedProfile));
      setEditedProfile(JSON.parse(savedProfile));
    }
  });

  const saveProfile = () => {
    setAgentProfile(editedProfile());
    localStorage.setItem('agentProfile', JSON.stringify(editedProfile()));
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditedProfile({...agentProfile()});
    setIsEditing(false);
  };

  const updateField = (field, value) => {
    setEditedProfile(prev => ({...prev, [field]: value}));
  };

  const updateArrayField = (field, value) => {
    const array = value.split(',').map(item => item.trim());
    setEditedProfile(prev => ({...prev, [field]: array}));
  };

  return (
    <div class={styles.profilePage}>
      <div class={styles.profileHeader}>
        <div class={styles.profileImage}>
          <img src={agentProfile().photoUrl} alt={agentProfile().name} />
          {isEditing() && (
            <input
              type="text"
              value={editedProfile().photoUrl}
              onInput={(e) => updateField('photoUrl', e.target.value)}
              class={styles.photoUrlInput}
              placeholder="Photo URL"
            />
          )}
          <button class={styles.editPhotoButton}>
            <FiEdit2 />
          </button>
        </div>
        <div class={styles.headerInfo}>
          {isEditing() ? (
            <div class={styles.editFields}>
              <input
                type="text"
                value={editedProfile().name}
                onInput={(e) => updateField('name', e.target.value)}
                class={styles.editInput}
                placeholder="Name"
              />
              <input
                type="text"
                value={editedProfile().agency}
                onInput={(e) => updateField('agency', e.target.value)}
                class={styles.editInput}
                placeholder="Agency"
              />
              <input
                type="email"
                value={editedProfile().email}
                onInput={(e) => updateField('email', e.target.value)}
                class={styles.editInput}
                placeholder="Email"
              />
              <input
                type="tel"
                value={editedProfile().phone}
                onInput={(e) => updateField('phone', e.target.value)}
                class={styles.editInput}
                placeholder="Phone"
              />
            </div>
          ) : (
            <>
              <h1>{agentProfile().name}</h1>
              <p class={styles.agency}>{agentProfile().agency}</p>
              <div class={styles.contactInfo}>
                <span><FiMail /> {agentProfile().email}</span>
                <span><FiPhone /> {agentProfile().phone}</span>
              </div>
            </>
          )}
        </div>
        <div class={styles.editButtons}>
          {isEditing() ? (
            <>
              <button onClick={saveProfile} class={styles.saveButton}>
                <FiSave /> Save
              </button>
              <button onClick={cancelEdit} class={styles.cancelButton}>
                <FiX /> Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} class={styles.editButton}>
              <FiEdit2 /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div class={styles.profileContent}>
        <div class={styles.mainSection}>
          <section class={styles.aboutSection}>
            <h2>About Me</h2>
            {isEditing() ? (
              <textarea
                value={editedProfile().aboutMe}
                onInput={(e) => updateField('aboutMe', e.target.value)}
                class={styles.editTextarea}
                placeholder="About me"
              />
            ) : (
              <p>{agentProfile().aboutMe}</p>
            )}
          </section>

          <section class={styles.specialtiesSection}>
            <h2>Specialties</h2>
            {isEditing() ? (
              <input
                type="text"
                value={editedProfile().specialties.join(', ')}
                onInput={(e) => updateArrayField('specialties', e.target.value)}
                class={styles.editInput}
                placeholder="Specialties (comma-separated)"
              />
            ) : (
              <div class={styles.tagsList}>
                {agentProfile().specialties.map(specialty => (
                  <span class={styles.tag}>{specialty}</span>
                ))}
              </div>
            )}
          </section>

          <section class={styles.certificationsSection}>
            <h2>Certifications</h2>
            <div class={styles.certificationsList}>
              {agentProfile().certifications.map(cert => (
                <div class={styles.certification}>
                  <FiAward />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div class={styles.sidebar}>
          <section class={styles.sidebarSection}>
            <h3>Preferred Regions</h3>
            <div class={styles.regionsList}>
              {agentProfile().regions.map(region => (
                <div class={styles.region}>
                  <FiMapPin />
                  <span>{region}</span>
                </div>
              ))}
            </div>
          </section>

          <section class={styles.sidebarSection}>
            <h3>Languages</h3>
            <div class={styles.languagesList}>
              {agentProfile().languages.map(language => (
                <div class={styles.language}>
                  <FiGlobe />
                  <span>{language}</span>
                </div>
              ))}
            </div>
          </section>

          <section class={styles.sidebarSection}>
            <h3>Business Details</h3>
            <div class={styles.businessDetails}>
              <div class={styles.detail}>
                <FiDollarSign />
                <span>Preferred Currency: {agentProfile().preferredCurrency}</span>
              </div>
              <div class={styles.detail}>
                <FiDollarSign />
                <span>Default Markup: {agentProfile().defaultMarkup}%</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AgentProfile; 