import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Course, Module } from '../types';

const AdminCourseManagementPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchModules = useCallback(async () => {
    if (!courseId) return;
    const { data } = await supabase.from('modules').select('*').eq('course_id', courseId).order('order');
    if (data) setModules(data);
  }, [courseId]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      setLoading(true);
      const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
      setCourse(courseData);
      await fetchModules();
      setLoading(false);
    };
    fetchCourse();
  }, [courseId, fetchModules]);

  const handleOpenModal = (module: Partial<Module> | null = null) => {
    setEditingModule(module || { course_id: courseId, title: '', order: modules.length + 1, video_url: '' });
    setVideoFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingModule(null);
    setVideoFile(null);
    setUploading(false);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule || !courseId) return;

    setUploading(true);
    let videoUrl = editingModule.video_url || '';

    if (videoFile) {
        const fileExt = videoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${courseId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
            .from('course_videos')
            .upload(filePath, videoFile);

        if (uploadError) {
            alert('Erro no upload do vídeo: ' + uploadError.message);
            setUploading(false);
            return;
        }

        videoUrl = filePath; // Store the path, not a public URL.
    }
    
    const moduleData = {
        course_id: courseId,
        title: editingModule.title || '',
        order: editingModule.order || 0,
        video_url: videoUrl,
    };

    const { error } = editingModule.id 
      ? await supabase.from('modules').update(moduleData).eq('id', editingModule.id)
      : await supabase.from('modules').insert(moduleData);
    
    if (error) {
        alert('Erro ao salvar o módulo: ' + error.message);
    } else {
        await fetchModules();
        handleCloseModal();
    }
    setUploading(false);
  };
  
  const handleDeleteModule = async (moduleId: string) => {
    const moduleToDelete = modules.find(m => m.id === moduleId);
    if (!moduleToDelete) return;
  
    if (window.confirm('Tem certeza que deseja excluir este módulo? O vídeo associado também será removido permanentemente.')) {
      // 1. Delete the database record
      const { error: dbError } = await supabase.from('modules').delete().eq('id', moduleId);
      
      if (dbError) {
        alert('Erro ao excluir módulo do banco de dados: ' + dbError.message);
        return; // Stop if the DB deletion fails
      }
      
      // 2. If DB deletion is successful, delete the video from storage
      if (moduleToDelete.video_url) {
        // Ensure we don't try to delete old full URLs
        const isPath = !moduleToDelete.video_url.startsWith('http');
        if (isPath) {
          const { error: storageError } = await supabase.storage
            .from('course_videos')
            .remove([moduleToDelete.video_url]);
            
          if (storageError) {
            // Log the error but don't block the UI, as the primary record is deleted.
            console.error("Error deleting video from storage:", storageError);
            alert('Módulo excluído, mas houve um erro ao remover o arquivo de vídeo. Verifique o armazenamento.');
          }
        }
      }
      
      // 3. Refresh the module list
      fetchModules();
    }
  }

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <Link to="/admin" className="text-orange-500 hover:underline">&larr; Voltar ao Painel</Link>
      <h1 className="text-3xl font-bold">Gerenciar Módulos: {course?.title}</h1>
      
      <div className="text-right">
        <button onClick={() => handleOpenModal()} className="bg-green-500 text-white px-4 py-2 rounded-md font-medium hover:bg-green-600">
            Adicionar Módulo
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordem</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {modules.map(module => (
              <tr key={module.id}>
                <td className="px-6 py-4 whitespace-nowrap">{module.order}</td>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{module.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                  <button onClick={() => handleOpenModal(module)} className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">Editar</button>
                  <button onClick={() => handleDeleteModule(module.id)} className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">{editingModule?.id ? 'Editar' : 'Adicionar'} Módulo</h2>
            <form onSubmit={handleSaveModule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Título do Módulo</label>
                <input type="text" value={editingModule?.title || ''} onChange={e => setEditingModule({...editingModule, title: e.target.value})} className="mt-1 w-full p-2 border rounded-md" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ordem</label>
                <input type="number" value={editingModule?.order || ''} onChange={e => setEditingModule({...editingModule, order: parseInt(e.target.value, 10)})} className="mt-1 w-full p-2 border rounded-md" required />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Arquivo de Vídeo (MP4)</label>
                <p className="text-xs text-gray-500 mb-2">
                    {editingModule?.id ? 'Envie um novo vídeo apenas se quiser substituir o atual.' : 'Selecione o vídeo para este módulo.'}
                </p>
                <input type="file" accept="video/mp4" onChange={e => setVideoFile(e.target.files ? e.target.files[0] : null)} className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={handleCloseModal} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                <button type="submit" disabled={uploading} className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 disabled:bg-orange-300">
                    {uploading ? 'Salvando...' : 'Salvar Módulo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourseManagementPage;
