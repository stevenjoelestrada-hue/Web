import { useState, useEffect, useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './components/layout/Dashboard'
import CreateFolderModal from './components/files/CreateFolderModal'
import FileList from './components/files/FileList'
import FileUpload from './components/files/FileUpload'
import FilePreview from './components/files/FilePreview'
import SharedFileView from './components/files/SharedFileView'
import ShareModal from './components/files/ShareModal'
import NotesDashboard from './components/notes/NotesDashboard'
import WelcomeScreen from './components/layout/WelcomeScreen'
import Settings from './components/layout/Settings'
import Calculator from './components/productivity/Calculator';
import Tasks from './components/productivity/Tasks';
import Calendar from './components/productivity/Calendar';
import { useFileManager, listUserFiles } from './hooks/useFileManager'
import { supabase, signInWithGoogle, signOutUser } from './supabase'
import { useNotification } from './context/NotificationContext'
import './App.css'

function FileManager() {
  const {
    files,
    addFile,
    deleteFile,
    restoreFile,
    permanentDeleteFile,
    renameFile,
    moveFile,
    activeCategory,
    setActiveCategory,
    counts,
    storageUsage,
    folders,
    createFolder,
    deleteFolder,
    renameFolder,
    moveFileToFolder,
    createShareLink,
    error,
    setError
  } = useFileManager();

  const { showNotification } = useNotification();

  const [notesActive, setNotesActive] = useState(false);



  const [selectedFile, setSelectedFile] = useState(null);
  const [sharingFile, setSharingFile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const loadProfile = () => {
      const savedProfile = localStorage.getItem('user_profile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    };

    loadProfile();
    window.addEventListener('profileUpdated', loadProfile);
    return () => window.removeEventListener('profileUpdated', loadProfile);
  }, []);

  const combinedUser = useMemo(() => {
    if (!user) return null;
    const savedProfile = JSON.parse(localStorage.getItem('user_profile') || '{}');
    const savedPic = localStorage.getItem('userProfilePicture');
    return {
      ...user,
      displayName: profile?.name || savedProfile.name || user.user_metadata?.full_name || 'Usuario',
      photoURL: savedPic || profile?.profilePhoto || savedProfile.profilePhoto || user.user_metadata?.avatar_url || ''
    };
  }, [user, profile]);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Removed repetitive console logs - uncomment only for debugging
  // useEffect(() => {
  //   async function testRead() {
  //     const { data, error } = await listUserFiles(user);
  //     console.log('FILES:', data);
  //     console.log('ERROR:', error);
  //   }
  //   if (user) testRead();
  // }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Login failed", error);
      setError(`Error: ${error.message}`);
      showNotification({ type: 'error', message: 'Error de autenticación, intenta de nuevo' });
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const displayFiles = useMemo(() => {
    if (!searchQuery.trim()) return files;
    return files.filter(file =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [files, searchQuery]);


  const getTitle = () => {
    if (searchQuery.trim()) return `Resultados de búsqueda: "${searchQuery}"`;

    if (activeCategory.startsWith('folder-')) {
      const folderId = activeCategory.replace('folder-', '');
      const folder = folders.find(f => f.id === folderId);
      return folder ? `Carpeta: ${folder.name}` : 'Carpeta no encontrada';
    }

    if (activeCategory === 'notes') return 'Mis Notas';
    if (activeCategory === 'tasks') return 'Mis Tareas';
    if (activeCategory === 'calendar') return 'Mi Calendario';
    if (activeCategory === 'calculator') return 'Calculadora';


    switch (activeCategory) {
      case 'dashboard': return 'Estadísticas';
      case 'all': return 'Todos los Archivos';
      case 'documents': return 'Documentos';
      case 'images': return 'Imágenes';
      case 'videos': return 'Videos';
      case 'music': return 'Música';
      case 'trash': return 'Papelera';
      default: return 'Mi Almacenamiento';
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Close mobile menu when category changes
    setIsMobileMenuOpen(false);
  }, [activeCategory]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</div>;

  return (
    <>
      {!user && <WelcomeScreen onLogin={handleLogin} />}
      {user && (
        <>
          {showCreateFolder && <CreateFolderModal onClose={() => setShowCreateFolder(false)} onCreate={createFolder} />}
          {sharingFile && <ShareModal file={sharingFile} onClose={() => setSharingFile(null)} onCreateLink={createShareLink} />}

          <AppLayout
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            sidebar={
              <Sidebar
                activeCategory={activeCategory}
                onSelectCategory={(cat) => {
                  setActiveCategory(cat);
                  setSearchQuery(''); // Clear search on category change
                  setIsMobileMenuOpen(false);
                }}
                counts={counts}
                storageUsage={storageUsage}
                folders={folders}
                onOpenCreateFolder={() => setShowCreateFolder(true)}
                onDeleteFolder={deleteFolder}
                onRenameFolder={renameFolder}
                user={combinedUser}
              />
            }
            user={combinedUser}
            onLogout={handleLogout}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
          >
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>{getTitle()}</h2>
                {searchQuery.trim() && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      background: 'none', border: 'none', color: 'var(--primary-color)',
                      cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500
                    }}
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>

              {error && (
                <div className="error-banner" style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{error}</span>
                  <button onClick={() => setError(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>
              )}

              {activeCategory === 'dashboard' && !searchQuery ? (
                <Dashboard
                  files={files}
                  folders={folders}
                  storageUsage={storageUsage}
                  onNavigate={(category) => setActiveCategory(category)}
                  onPreview={setSelectedFile}
                  onUpload={addFile}
                />
              ) : activeCategory === 'notes' ? (
                <NotesDashboard />
              ) : activeCategory === 'tasks' ? (
                <Tasks />
              ) : activeCategory === 'calendar' ? (
                <Calendar />
              ) : activeCategory === 'calculator' ? (
                <Calculator />
              ) : activeCategory === 'settings' ? (
                <Settings
                  user={combinedUser}
                  onLogout={handleLogout}
                  onSelectCategory={setActiveCategory}
                />
              ) : (
                <>
                  {activeCategory !== 'trash' && !searchQuery && (
                    <FileUpload onUpload={addFile} />
                  )}

                  <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Archivos</h3>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{displayFiles.length} elementos</span>
                  </div>

                  {displayFiles.length === 0 && searchQuery ? (
                    <div style={{
                      textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)',
                      background: 'var(--component-bg)', borderRadius: '12px', marginTop: '2rem', border: '1px solid var(--border-color)'
                    }}>
                      <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>🔍</p>
                      <p>No se encontraron archivos que coincidan con "{searchQuery}"</p>
                    </div>
                  ) : (
                    <FileList
                      files={displayFiles}
                      folders={folders}
                      onDelete={deleteFile}
                      onRestore={restoreFile}
                      onPermanentDelete={permanentDeleteFile}
                      onRename={renameFile}
                      onMove={moveFile}
                      onMoveToFolder={moveFileToFolder}
                      onShare={setSharingFile}
                      onPreview={setSelectedFile}
                    />
                  )}
                </>
              )}

              {selectedFile && (
                <FilePreview file={selectedFile} onClose={() => setSelectedFile(null)} />
              )}
            </div>
          </AppLayout>
        </>
      )}
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<FileManager />} />
      <Route path="/share/:linkId" element={<SharedFileView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App
