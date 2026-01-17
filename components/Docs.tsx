
import React, { useState } from 'react';

const Docs: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'FEATURES' | 'AI_ENGINE' | 'DEV_GUIDE'>('FEATURES');

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 font-['Cairo'] text-right pb-32" dir="rtl">
      
      {/* Header Section */}
      <div className="bg-slate-900 text-white p-10 lg:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-40 -mt-40"></div>
         <div className="relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl mx-auto mb-8 flex items-center justify-center text-4xl border border-white/20 shadow-2xl">📖</div>
            <h2 className="text-4xl lg:text-6xl font-black mb-4 tracking-tight">مركز التوثيق والدليل التقني</h2>
            <p className="text-blue-300 text-sm lg:text-lg font-bold max-w-2xl mx-auto leading-relaxed">فهم بنية النظام الذكي، آلية التحليل، وإرشادات التطوير المستقبلي للمنظومة.</p>
         </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-2 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl gap-2 sticky top-4 z-50 backdrop-blur-xl">
         <TabBtn active={activeSection === 'FEATURES'} onClick={() => setActiveSection('FEATURES')} label="شرح أقسام النظام" icon="🛠️" />
         <TabBtn active={activeSection === 'AI_ENGINE'} onClick={() => setActiveSection('AI_ENGINE')} label="محرك الذكاء الاصطناعي" icon="🧠" />
         <TabBtn active={activeSection === 'DEV_GUIDE'} onClick={() => setActiveSection('DEV_GUIDE')} label="دليل المطورين (API)" icon="💻" />
      </div>

      {/* Features Section */}
      {activeSection === 'FEATURES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
           <FeatureCard 
             title="الإحصائيات والداشبورد" 
             desc="القلب النابض للنظام، يقوم بتحليل البيانات اللحظية للمعاملات المالية والإدارية وتحويلها إلى رسوم بيانية تفاعلية تساعد في اتخاذ القرار." 
             icon="💎" 
           />
           <FeatureCard 
             title="الأرشفة الموحدة (الميدانية)" 
             desc="نظام إدخال ذكي يحاكي الاستمارات الورقية، يدعم المسح الضوئي للهويات والبيانات الجمركية عبر الـ AI لتقليل الخطأ البشري." 
             icon="📜" 
           />
           <FeatureCard 
             title="الإدارة المالية" 
             desc="وحدة محاسبية متكاملة تدير المقبوضات والمنصرفات، وتوفر تقارير تصفية دقيقة لكل معاملة على حدة مع مراقبة المديونيات." 
             icon="💳" 
           />
           <FeatureCard 
             title="أرشيف الصور والوسائط" 
             desc="مخزن سحابي محلي ينظم كافة الصور المرفقة (هويات، مركبات، وثائق) ويسمح بالبحث داخل محتوى الصور باستخدام الـ OCR." 
             icon="🖼️" 
           />
        </div>
      )}

      {/* AI Engine Section */}
      {activeSection === 'AI_ENGINE' && (
        <div className="bg-white dark:bg-slate-900 p-10 lg:p-16 rounded-[4rem] border border-slate-100 dark:border-white/5 shadow-sm space-y-12 animate-in zoom-in-95">
           <div className="flex flex-col md:flex-row gap-10">
              <div className="flex-1 space-y-6">
                 <h3 className="text-3xl font-black dark:text-white">آلية التحليل الذكي (Gemini Pro)</h3>
                 <p className="text-slate-500 font-bold leading-loose">
                   يعتمد النظام على نموذج <span className="text-blue-600">Google Gemini-3-Flash</span> لمعالجة الرؤية الحاسوبية (Computer Vision). عندما يقوم المستخدم برفع صورة (هوية أو بيان جمركي)، يقوم النظام بما يلي:
                 </p>
                 <ul className="space-y-4 pr-6">
                    <li className="flex items-start gap-4">
                       <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-1">1</span>
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-300">تحويل الصورة إلى Base64 وإرسالها لمشغل الـ API مع "برومبت" هندسي مخصص.</p>
                    </li>
                    <li className="flex items-start gap-4">
                       <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-1">2</span>
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-300">استخراج البيانات في قالب JSON مهيكل لضمان توافقها مع قاعدة بيانات النظام.</p>
                    </li>
                    <li className="flex items-start gap-4">
                       <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 mt-1">3</span>
                       <p className="text-sm font-bold text-slate-700 dark:text-slate-300">استنتاج صلة القرابة بين المعرفين والمالك عبر تحليل الألقاب والأسماء الرباعية.</p>
                    </li>
                 </ul>
              </div>
              <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-800 p-8 rounded-[3rem] border border-slate-100 dark:border-white/5 flex flex-col items-center justify-center text-center">
                 <div className="w-24 h-24 bg-blue-600/10 text-blue-600 rounded-full flex items-center justify-center text-5xl mb-6">🤖</div>
                 <h4 className="font-black text-xl dark:text-white">Model: Gemini 3</h4>
                 <p className="text-[10px] font-black text-blue-600 mt-2">FLASH PREVIEW v09-2025</p>
              </div>
           </div>
        </div>
      )}

      {/* Developer Guide Section */}
      {activeSection === 'DEV_GUIDE' && (
        <div className="bg-slate-900 p-10 lg:p-16 rounded-[4rem] shadow-2xl space-y-10 animate-in zoom-in-95 text-right overflow-hidden relative">
           <div className="absolute top-0 left-0 p-10 opacity-10 font-mono text-[100px] font-black text-blue-500 pointer-events-none">API</div>
           <div className="relative z-10">
              <h3 className="text-3xl font-black text-white mb-6">دليل المطور: استبدال محرك الـ AI</h3>
              <p className="text-slate-400 font-bold mb-10 leading-relaxed max-w-3xl">
                بنية النظام مرنة للغاية. لاستبدال نموذج Gemini بنموذج آخر (مثل GPT-4o)، يحتاج المطور فقط لتعديل ملف <code className="text-blue-400 bg-white/5 px-2 py-1 rounded">services/geminiService.ts</code>.
              </p>

              <div className="space-y-6">
                 <h4 className="text-emerald-400 font-black text-lg">الخطوات البرمجية:</h4>
                 <div className="bg-black/50 p-8 rounded-[2rem] border border-white/5 font-mono text-left dir-ltr overflow-x-auto">
                   <pre className="text-blue-300 text-xs leading-loose">
{`// 1. استبدال المكتبة المستوردة
import OpenAI from "openai"; // مثال

// 2. تحديث دالة التحليل
export const analyzeNationalIdCard = async (imageBase64: string) => {
  // بدلاً من استدعاء Gemini، قم باستدعاء المحرك الجديد هنا
  // تأكد من الحفاظ على نفس أسماء حقول الـ JSON المسترجعة
  // (name, idNumber, dob, province...)
  
  const response = await myNewAI.process(imageBase64);
  return response.json; 
};`}
                   </pre>
                 </div>
                 <div className="p-6 bg-blue-600/10 rounded-3xl border border-blue-500/20">
                    <p className="text-xs font-black text-blue-400 leading-relaxed">💡 ملاحظة تقنية: النظام يعتمد بشكل كلي على "البيانات المهيكلة" (Structured Outputs). طالما أن النموذج الجديد يعيد البيانات بنفس أسماء الحقول، فلن تحتاج لتعديل أي واجهة برمجية أخرى في النظام.</p>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[2.2rem] font-black text-xs lg:text-sm transition-all ${active ? 'bg-blue-600 text-white shadow-xl scale-[1.02]' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
  </button>
);

const FeatureCard = ({ title, desc, icon }: any) => (
  <div className="bg-white dark:bg-slate-900 p-8 lg:p-12 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-sm group hover:shadow-2xl transition-all">
     <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">{icon}</div>
     <h4 className="text-xl font-black dark:text-white mb-4">{title}</h4>
     <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-loose">{desc}</p>
  </div>
);

export default Docs;
