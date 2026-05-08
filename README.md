# Swapill - منصة تبادل المهارات | Skill Exchange Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</div>

## English

Swapill is a modern skill-exchange platform that connects people who want to share and learn different skills. Whether you're looking to teach your expertise or learn something new, Swapill makes skill swapping easy and accessible.

### Features

- 🔍 **Skill Discovery**: Browse and discover various skills offered by community members
- 💬 **Real-time Chat**: Built-in messaging system for seamless communication
- 👤 **User Profiles**: Comprehensive profiles showcasing skills and experience
- 🔄 **Skill Swapping**: Request and manage skill exchange arrangements
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🌐 **Multi-language Support**: Arabic and English interface

### Technologies Used

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS for modern, responsive design
- **Backend**: Supabase for database and authentication
- **Real-time**: Supabase Realtime for live messaging
- **State Management**: React Context API
- **Routing**: React Router
- **Icons**: Lucide React Icons

---

## العربية

سوابل هي منصة حديثة لتبادل المهارات تربط بين الأشخاص الذين يرغبون في مشاركة وتعلم مهارات مختلفة. سواء كنت تريد تعليم خبراتك أو تعلم شيء جديد، سوابل تجعل تبادل المهارات سهلاً ومتاحاً للجميع.

### المميزات

- 🔍 **اكتشاف المهارات**: تصفح واكتشف المهارات المختلفة المقدمة من أعضاء المجتمع
- 💬 **دردشة فورية**: نظام مراسلة مدمج للتواصل السلس
- 👤 **ملفات تعريف المستخدمين**: ملفات تعريف شاملة تعرض المهارات والخبرات
- 🔄 **تبادل المهارات**: طلب وإدارة ترتيبات تبادل المهارات
- 📱 **تصميم متجاوب**: يعمل بسلاسة على أجهزة الكمبيوتر والهاتف
- 🌐 **دعم متعدد اللغات**: واجهة باللغتين العربية والإنجليزية

### التقنيات المستخدمة

- **الواجهة الأمامية**: React 18 مع TypeScript
- **التصميم**: Tailwind CSS للتصميم العصري والمتجاوب
- **الواجهة الخلفية**: Supabase لقاعدة البيانات والمصادقة
- **الوقت الفعلي**: Supabase Realtime للمراسلة المباشرة
- **إدارة الحالة**: React Context API
- **التوجيه**: React Router
- **الأيقونات**: Lucide React Icons

---

## Installation / التثبيت

1. Clone the repository:
```bash
git clone https://github.com/maryamkhaledd84/swapill-app.git
cd swapill-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

4. Start the development server:
```bash
npm run dev
```

## Environment Variables / متغيرات البيئة

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure / هيكل المشروع

```
swapill-app/
├── src/
│   ├── components/          # React components
│   │   ├── layout/        # Layout components
│   │   ├── dashboard/     # Dashboard components
│   │   └── shared/        # Shared components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── utils/             # Utility functions
│   └── hooks/            # Custom hooks
├── supabase/             # Database migrations and setup
├── public/               # Static assets
└── README.md
```

## Contributing / المساهمة

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License / الرخصة

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact / التواصل

For questions and support, please reach out to:
- GitHub: [@maryamkhaledd84](https://github.com/maryamkhaledd84)
- Email: your-email@example.com

---

<div align="center">
  <p>Made with ❤️ by Maryam Khalid</p>
  <p>صُنعت بحب ❤️ من قبل مريم خالد</p>
</div>
