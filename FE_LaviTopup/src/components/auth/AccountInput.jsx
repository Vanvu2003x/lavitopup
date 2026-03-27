export default function FormInputAccInfo({ accountInfo, onChange, onClose, onSubmit }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
                >
                    ×
                </button>

                <h3 className="text-lg font-semibold mb-4 text-center">🔐 Điền thông tin tài khoản</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Tài khoản (Username):
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={accountInfo.username}
                            onChange={onChange}
                            placeholder="Ví dụ: user123"
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Mật khẩu:
                        </label>
                        <input
                            type="text"
                            name="password"
                            value={accountInfo.password}
                            onChange={onChange}
                            placeholder="Ví dụ: pass123"
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Máy chủ (Server):
                        </label>
                        <input
                            type="text"
                            name="server"
                            value={accountInfo.server}
                            onChange={onChange}
                            placeholder="Ví dụ: S1, S2, VN1..."
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                        />
                    </div>

                    <button
                        onClick={onSubmit}
                        className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        ✅ Xác nhận
                    </button>
                </div>
            </div>
        </div>
    );
}
