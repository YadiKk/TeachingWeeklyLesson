# Weekly Lesson Tracker

A simple, clean web application for tracking weekly lessons for multiple students. Built with React and TailwindCSS.

## 🚀 Features

- **Student Management**: Add, edit, and delete students
- **Flexible Scheduling**: Choose specific days for lessons per student
- **Time Management**: Set specific times for each lesson
- **Today's Overview**: See all lessons scheduled for today in one place
- **Week Navigation**: Navigate between previous and next weeks
- **Custom Week Start**: Choose which day your week starts (Sunday to Saturday)
- **Visual Progress Tracking**: Check off completed lessons with ✅ marks
- **Lesson Status Management**: Mark lessons as pending, completed, or cancelled
- **Cancelled Lessons View**: Track and manage cancelled lessons separately
- **Data Persistence**: All data saved in localStorage
- **Responsive Design**: Clean, modern UI that works on all devices
- **Turkish Localization**: Date formatting in Turkish locale

## 🛠️ Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/weekly-lesson-tracker.git
cd weekly-lesson-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
npm run build
```

This builds the app for production to the `build` folder.

### Deploying to GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add deploy script to package.json:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

3. Deploy:
```bash
npm run deploy
```

## 📖 Usage

1. **Add Students**: Use the "Add New Student" form to create student profiles
2. **Choose Lesson Days**: Select which days of the week each student will have lessons
3. **Set Lesson Times**: Click on the time dropdown to set specific times for each lesson
4. **View Today's Lessons**: See all lessons scheduled for today in the overview section
5. **Navigate Weeks**: Use "Previous Week" and "Next Week" buttons to navigate between weeks
6. **Customize Week Start**: Choose which day your week starts from the dropdown
7. **Track Progress**: Use the status buttons to mark lessons as pending, completed, or cancelled
8. **Edit Students**: Click on student names to edit them
9. **Delete Students**: Use the "Delete" button to remove students
10. **Manage Cancelled Lessons**: View and restore cancelled lessons in the dedicated tab

## 🎯 Key Features Explained

### Lesson Status Management
- **Pending**: Default state for new lessons
- **Completed**: Mark lessons as completed with a green checkmark
- **Cancelled**: Cancel lessons with a red X mark

### Week Navigation
- Navigate between weeks while preserving lesson states
- Customize which day your week starts (Sunday to Saturday)
- Automatic lesson generation for new weeks

### Data Persistence
- All data is automatically saved to browser's localStorage
- No server required - works completely offline
- Data persists between browser sessions

## 🛠️ Technology Stack

- **React 18** - Modern React with hooks
- **TailwindCSS 3** - Utility-first CSS framework
- **Local Storage API** - Client-side data persistence
- **Modern JavaScript (ES6+)** - Latest JavaScript features

## 🌐 Browser Support

Works in all modern browsers that support:
- ES6 features
- Local Storage
- CSS Grid and Flexbox

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── AddStudentForm.js
│   ├── CancelledLessons.js
│   ├── DaySelector.js
│   ├── LessonList.js
│   ├── LessonStatusSelector.js
│   ├── StudentCard.js
│   ├── TimeSelector.js
│   ├── TodaysLessons.js
│   └── WeekControls.js
├── hooks/              # Custom React hooks
│   └── useLocalStorage.js
├── utils/              # Utility functions
│   ├── dateUtils.js
│   └── storage.js
├── App.js              # Main application component
├── index.js            # Application entry point
└── index.css           # Global styles and Tailwind imports
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with React and TailwindCSS
- Icons from Heroicons
- Date formatting with Turkish locale support
