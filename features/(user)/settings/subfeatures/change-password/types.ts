export type ChangePasswordFormValues = {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
};

export type ChangePasswordResult =
    | {
        success: true;
        message: string;
    }
    | {
        success: false;
        message: string;
        field?: keyof ChangePasswordFormValues;
    };