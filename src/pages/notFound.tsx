import { FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState } from '@/components/ui';
export default function NotFound() {
    const navigate = useNavigate();
    return (
        <div className="flex min-h-svh items-center justify-center bg-[var(--app-bg)]"><EmptyState icon={<FileQuestion />} title="Trang không tồn tại" description="Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển." action={<Button variant="primary" onClick={() => navigate('/dashboard')}>Về trang chủ</Button>} /></div>
    );
}
