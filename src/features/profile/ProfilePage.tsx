import { CalendarDays, Key, Mail, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, ErrorPanel, PageHeader, Skeleton, StatCard } from '@/components/ui';
import { expiryText, planChargesCredits, planExpiry } from '@/features/plan/planCopy';
import { useMe } from '@/hooks/useMe';
import { formatDate } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
export default function ProfilePage() {
    const navigate = useNavigate();
    const { data: me, isPending, error, refetch } = useMe();
    if (isPending) return (
        <div className="mx-auto max-w-5xl space-y-4 px-4 py-6 sm:px-6">
            <Skeleton className="h-8 w-48" /><Skeleton className="h-40 w-full" /><Skeleton className="h-48 w-full" />
        </div>
    );
    if (!me) return (
        <div className="mx-auto max-w-5xl px-4 py-6">
            <ErrorPanel title="Không thể tải hồ sơ" message={getErrorMessage(error)} onRetry={() => void refetch()} />
        </div>
    );
    const { user, plan, balance, keys } = me;
    const name = user.name?.trim() || user.email;
    const subscription = me.commercialMode === 'subscription';
    const expiry = planExpiry(user.planExpiresAt);
    const showBalance = !subscription || planChargesCredits(plan);
    const activeKeys = keys.filter((k) => !k.revokedAt).length;
    return (
        <div className="min-h-full bg-[var(--app-bg)]">
            <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
                <PageHeader title="Hồ sơ" description="Quản lý thông tin cá nhân và tài khoản." />
                {!user.emailVerified && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--app-warning)]/30 bg-[var(--app-warning-soft)] px-4 py-3">
                        <p className="text-sm text-[var(--app-warning)]">Email chưa được xác minh. Hãy kiểm tra hộp thư của bạn.</p>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/verify-email?email=${encodeURIComponent(user.email)}`)}>Gửi lại email xác minh</Button>
                    </div>
                )}
                <Card className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--app-accent)] text-2xl font-semibold text-white">{name.charAt(0).toUpperCase()}</div>
                        <div className="min-w-0 flex-1">
                            <h2 className="text-lg font-semibold text-[var(--app-text)]">{name}</h2>
                            <p className="mt-1 text-sm text-[var(--app-text-secondary)]">{user.email}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Badge variant="accent">{plan?.name ?? 'Miễn phí'}</Badge>
                                <Badge variant={user.emailVerified ? 'success' : 'warning'}>{user.emailVerified ? 'Đã xác minh' : 'Chưa xác minh'}</Badge>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" disabled title="Tính năng đang phát triển">Chỉnh sửa hồ sơ</Button>
                    </div>
                </Card>
                <Card>
                    <div className="border-b border-[var(--app-border)] px-5 py-4 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--app-accent-soft)] text-[var(--app-accent)]"><Mail className="h-4 w-4" /></div><h3 className="text-sm font-semibold text-[var(--app-text)]">Thông tin cá nhân</h3></div>
                    <div className="grid gap-5 p-5 sm:grid-cols-2">
                        <div><p className="text-xs text-[var(--app-text-muted)]">Họ tên</p><p className="mt-1 text-sm font-medium text-[var(--app-text)]">{user.name || '—'}</p></div>
                        <div><p className="text-xs text-[var(--app-text-muted)]">Email</p><p className="mt-1 text-sm font-medium text-[var(--app-text)]">{user.email}</p></div>
                        <div><p className="text-xs text-[var(--app-text-muted)]">Trạng thái</p><div className="mt-1 flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${user.status === 'active' ? 'bg-[var(--app-success)]' : 'bg-[var(--app-danger)]'}`} /><p className="text-sm font-medium text-[var(--app-text)]">{user.status === 'active' ? 'Đang hoạt động' : 'Bị khoá'}</p></div></div>
                        <div><p className="text-xs text-[var(--app-text-muted)]">Ngày tham gia</p><div className="mt-1 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[var(--app-text-muted)]" /><p className="text-sm font-medium text-[var(--app-text)]">{formatDate(user.createdAt)}</p></div></div>
                    </div>
                </Card>
                <Card>
                    <div className="border-b border-[var(--app-border)] px-5 py-4"><h3 className="text-sm font-semibold text-[var(--app-text)]">{subscription ? 'Gói dịch vụ' : 'Gói & credits'}</h3></div>
                    <div className="grid gap-4 p-5 sm:grid-cols-3">
                        <StatCard
                            label="Gói"
                            value={plan?.name ?? 'Miễn phí'}
                            description={subscription ? <Button variant="link" size="sm" onClick={() => navigate('/my-plan')}>Xem gói →</Button> : plan ? `${plan.monthlyCredits} credits/tháng` : undefined}
                        />
                        {subscription && <StatCard label="Hạn gói" value={expiry.state === 'none' ? 'Không thời hạn' : expiryText(expiry)} description={expiry.state !== 'none' ? formatDate(expiry.at) : undefined} />}
                        {showBalance && <StatCard label="Số dư" value={balance.display} description={subscription ? undefined : <Button variant="link" size="sm" onClick={() => navigate('/billing')}>Nạp credits</Button>} />}
                        <StatCard label="Task đồng thời" value={String(plan?.maxConcurrent ?? '—')} />
                    </div>
                </Card>
                <Card className="p-5"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><Key className="h-5 w-5 text-[var(--app-text-muted)]" /><div><p className="text-sm font-medium text-[var(--app-text)]">API keys</p><p className="mt-0.5 text-xs text-[var(--app-text-muted)]">{activeKeys} key đang hoạt động</p></div></div><Button variant="outline" size="sm" onClick={() => navigate('/settings/api-keys')}>Quản lý</Button></div></Card>
                <Card className="p-5"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[var(--app-text-muted)]" /><div><p className="text-sm font-medium text-[var(--app-text)]">Bảo mật</p><p className="mt-0.5 text-xs text-[var(--app-text-muted)]">Mật khẩu và phiên đăng nhập</p></div></div><Button variant="outline" size="sm" onClick={() => navigate('/settings/security')}>Quản lý</Button></div></Card>
            </div>
        </div>
    );
}
