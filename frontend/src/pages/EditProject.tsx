import { useParams } from 'react-router-dom';
import Publish from './Publish';

export default function EditProject() {
  const { id } = useParams();
  
  // In a real app, fetch project data by id
  // For now, reuse the Publish component
  return <Publish />;
}
