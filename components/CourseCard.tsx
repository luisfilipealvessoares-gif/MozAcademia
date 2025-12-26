
import React from 'react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => void;
  isEnrolled: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEnroll, isEnrolled }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.title}</h3>
        <p className="text-gray-600 mb-4 h-24 overflow-hidden">{course.description}</p>
        {isEnrolled ? (
           <div className="text-center py-2 px-4 bg-brand-light text-brand-up rounded-md font-semibold">
           Inscrito
         </div>
        ) : (
          <button
            onClick={() => onEnroll(course.id)}
            className="w-full bg-brand-moz text-white py-2 px-4 rounded-md font-semibold hover:bg-brand-up transition"
          >
            Inscrever-se
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;