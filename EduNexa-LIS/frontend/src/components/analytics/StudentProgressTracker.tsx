import React, { useState, useEffect } from 'react';
import { StudentProgressAPI, StudentProgress } from '../../services/studentProgressAPI';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Award,
  Activity,
  FileText,
  Clock,
  RefreshCw
} from 'lucide-react';

interface StudentProgressTrackerProps {
  courseId?: string;
}

export const StudentProgressTracker: React.FC<StudentProgressTrackerProps> = ({ courseId }) => {
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'attention' | 'active' | 'inactive'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStudentsProgress = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      let studentsData: StudentProgress[];
      
      if (courseId) {
        const courseProgress = await StudentProgressAPI.getCourseStudentsProgress(courseId);
        studentsData = courseProgress.students.map(s => ({
          student_id: s.student_id,
          student_name: s.student_name,
          student_email: s.student_email,
          roll_no: s.roll_no,
          department: '',
          course_id: courseProgress.course_id,
          course_title: courseProgress.course_title,
          enrolled_at: s.enrolled_at,
          progress: s.overall_progress,
          completed_materials: 0,
          total_materials: 0,
          assignments_submitted: s.assignments_submitted,
          total_assignments: 0,
          average_grade: s.average_grade,
          engagement_score: s.overall_progress,
          last_activity: s.last_activity,
          is_active: s.is_active,
          needs_attention: s.overall_progress < 30
        }));
      } else {
        studentsData = await StudentProgressAPI.getAllStudentsProgress();
      }

      setStudents(studentsData);
    } catch (err) {
      console.error('Failed to fetch students progress:', err);
      setError('Failed to load student progress data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentsProgress();
  }, [courseId]);

  const handleRefresh = () => {
    fetchStudentsProgress(true);
  };

  const filteredStudents = students.filter(student => {
    switch (filter) {
      case 'attention':
        return student.needs_attention;
      case 'active':
        return student.is_active && !student.needs_attention;
      case 'inactive':
        return !student.is_active;
      default:
        return true;
    }
  });

  const stats = {
    total: students.length,
    needsAttention: students.filter(s => s.needs_attention).length,
    active: students.filter(s => s.is_active).length,
    avgProgress: students.length > 0 
      ? students.reduce((sum, s) => sum + s.progress, 0) / students.length 
      : 0,
    avgEngagement: students.length > 0 
      ? students.reduce((sum, s) => sum + s.engagement_score, 0) / students.length 
      : 0
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Progress Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Student Progress Tracking</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Students</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Need Attention</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.needsAttention}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Avg Progress</p>
                <p className="text-2xl font-bold text-green-900">{stats.avgProgress.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg Engagement</p>
                <p className="text-2xl font-bold text-purple-900">{stats.avgEngagement.toFixed(1)}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({students.length})
          </button>
          <button
            onClick={() => setFilter('attention')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'attention'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Need Attention ({stats.needsAttention})
          </button>
          <button
            onClier;
gressTrackntPro Studert default
expo
  );
};
</div>div>
        </       )}
  ))
      iv>
           </d     /div>
            <
   button>       </        
 Details →w     Vie             >
                 medium"
t-xt-sm fonlors teion-cod-lg transite-50 roundelu:bg-b0 hovert-blue-60x-4 py-2 texme="ml-4 p    classNa          
    t_id}`}tuden${student.scs/student/= `/analytiation.href locw.ndo> wik={() =      onClic  
          tton       <bu       
  v>
      </di          
    </div>          iv>
      </d                  
v>di          </        span>
           </               }
  ateString()leDvity).toLocat.last_acti(studen  {new Date                 ">
       00gray-9ium text-sm font-med="text-assNamespan cl         <               600" />
y-ratext-g-4 w-4 e="hck classNam        <Clo                gap-1">
ems-center "flex itame=<div classN                 </p>
     ast Activitymb-1">L500 s text-gray--xName="text    <p class                
      <div>               /div>

      <           >
       </div            
       n>/spa          <            
  1) : 'N/A'}Fixed(_grade.todent.average? stu_grade > 0 rageent.ave   {stud            
           ray-900"> text-gdiumnt-me fo"text-smlassName=<span c                        " />
n-600t-gree texw-4sName="h-4 rd clasAwa    <                 >
   -1"ter gapcentems-x iflessName=" cla  <div                   p>
 e</ Grad>Avg-1"00 mb text-gray-5="text-xsassName      <p cl            div>
       <          

         </div>                 >
        </div     
          an>   </sp                
     }mentsassigndent.total_mitted}/{stunts_subsignmet.asstuden  {                    >
    -900" text-grayum-meditext-sm fonte="assNam<span cl                   
     />ue-600"  w-4 text-ble="h-4sNameText clas        <Fil             ">
   1gap-tems-center "flex ie=sNam <div clas                  
   ments</p>ssignmb-1">Aray-500 xt-g"text-xs tee= <p classNam               
           <div>          

        </div>         
             </div>            >
     ansp </                       Fixed(0)}
score.toement_ngagent.e      {stud            
        ">-900ext-graynt-medium tfo-sm ext"tme=an classNa       <sp                 " />
t-purple-600-4 w-4 texsName="hlastivity c     <Ac               
    -1"> gapnterlex items-celassName="f     <div c            t</p>
     ">Engagemen1mb-t-gray-500 text-xs tex=" className        <p           <div>
                    /div>

          <            div>
  </                    pan>
         </s                d(0)}%
s.toFixe.progresudent      {st          
          ay-900">ext-gront-medium tsm fe="text-an classNam         <sp       v>
           </di                /div>
      ><                 
        }}ss}%` udent.progre${st={{ width: `style                            }`}
                     '
       d-500 : 'bg-re                            -500'
   yellowg-       ? 'b                    0
     s >= 4rogresnt.p stude         :                     -500'
  -greenbg        ? '                     >= 70
   ess t.progren       stud                    ull ${
   -f2 roundedme={`h-   classNa                     <div
                             >
 "ull h-2nded-fgray-200 roux-1 bg-Name="flediv class       <           ">
       gap-2tertems-cenex iassName="fl <div cl                   >
  ress</prog">Pb-1500 mt-gray-xs tex"text-ssName=<p cla                
      <div>                    ">
ols-5 gap-4rid-c2 md:g-cols-d gride="grissNamv cla<di             
     </div>
           
       }}</span>itleourse_tnt.cude">{stlue-600"text-bssName=<span clarseId && {!cou                    /span>}
l_no}<t.rol {studenll:pan>Ro& <so &ent.roll_n     {stud           >
    ail}</spanudent_emstudent.st   <span>{        
         0 mb-3">ray-60xt-sm text-gp-4 tecenter gaflex items-lassName="      <div c                
       >
       /div <                  )}
                 /span>
      <              on
    ttenti ANeeds                      w-3" />
  e="h-3 ssNamiangle cla <AlertTr                     ">
  nter gap-1x items-cefull fleunded- roont-mediumt-xs fow-800 tex00 text-yellellow-1 bg-y"px-2 py-1sName=lasan c    <sp             (
     && ntion eeds_attedent.nstu       {             
/h3>ent_name}<nt.stud{stude-900">xt-graymibold tee="font-seassNam    <h3 cl              
  -2">ter gap-3 mbx items-cen="fleclassName    <div         >
      "flex-1"e=am<div classN           n">
     stify-betweeems-start juit"flex className=      <div        
 ors">ition-colay-50 trans hover:bg-grssName="p-4ent_id} clatudent.studkey={s       <div      udent => (
map(stdents.ilteredStu f      (
         ) :   iv>
</d          </p>
his filter for tents foundud">No sty-600text-gra"e= classNam     <p      />
 b-4" x-auto may-400 m text-grh-12 w-12me="sNaers clas    <Us        nter">
12 text-ceName="p-  <div class       ? (
  = 0s.length ==redStudentilte
        {f0">e-gray-20divid"divide-y lassName=   <div c   

>div     </div>
    </tton>
        </bu
       ctive})({stats.a Active         >
    
               }`}
      -200'g-grayer:bovt-gray-700 hexgray-100 t'bg-      :    
       white'xt-600 te'bg-green-      ?         e'
   === 'activ    filter
          ors ${-coltion transint-medium fonded-lgx-4 py-2 rou{`passName= cl
           tive')}ilter('ac setFck={() =>