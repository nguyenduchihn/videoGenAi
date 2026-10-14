/** Cầu nối để lib/api.ts tác động lên store/điều hướng mà không import vòng (store → api → store). */
type Fn = () => void;

let clearUserFn: Fn | null = null;
let openConnectDialogFn: Fn | null = null;
let redirectFn: (path: string) => void = (path) => window.location.assign(path);

export const storeRegistry = {
    setClearUser(fn: Fn): void { clearUserFn = fn; },
    setOpenConnectDialog(fn: Fn): void { openConnectDialogFn = fn; },
    setRedirect(fn: (path: string) => void): void { redirectFn = fn; },
    clearUser(): void { clearUserFn?.(); },
    openConnectDialog(): void { openConnectDialogFn?.(); },
    redirect(path: string): void { redirectFn(path); },
};
