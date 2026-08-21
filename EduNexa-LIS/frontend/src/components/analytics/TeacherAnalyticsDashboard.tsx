import React, { useState, useEffect } from 'react';
import { apiClient, API_ENDPOINTS } from '../../config/api';
import StudentProgressTracker from './StudentProgressTracker';
import {
  TrendingUp,
  Users,
  BookOpen,
  FileText,
  Award,
  Activity,
  BarChart3,
  PieChart,
  AlertTriangle,
  Clock,
  Target,
  RefreshCw
} from 'lucide-react';

interface TeacherAnalytics {
  dashboard_stats: {
    active_courses: number;
    total_students: number;
    pending_grades: number;
    course_rating: number;
    monthly_growth: {
      courses: number;
      students: number;
      rating_change: number;
    };
  };
  assignment_stats: {
    total_assignments: number;
    pending_submissions: number;
    graded_submissions: number;
    completion_rate: number;
    average_grade: number;
    grading_workload: Array<{
      assignment_id: string;
      assignment_title: string;
      course_title: string;
      due_date: string;
      pending_submissions: number;
      total_submissions: number;
      priority: 'high' | 'medium' | 'low';
    }>;
    assignment_performance: Array<{
      assignment_id: string;
      assignment_title: string;
      course_title: string;
      max_points: number;
      total_submissions: number;
      graded_submissions: number;
      submission_rate: number;
      average_grade: number;
      grade_percentage: number;
    }>;
  };
}

export const TeacherAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'assignments'>('overview');

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [dashboardData, assignmentData] = await Promise.all([
        apiClient.get<{ dashboard_stats: TeacherAnalytics['dashboard_stats'] }>(
          API_ENDPOINTS.ANALYTICS.TEACHER_DASHBOARD
        ),
        apiClient.get<{ assignment_stats: TeacherAnalytics['assignment_stats'] }>(
          API_ENDPOINTS.ANALYTICS.TEACHER_ASSIGNMENTS
        )
      ]);

      setAnalytics({
        dashboard_stats: dashboardData.dashboard_stats,
        assignment_stats: assignmentData.assignment_stats
      });
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Analytics</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { dashboard_stats, assignment_stats } = analytics;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your teaching performance and student engagement</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'students'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Student Progress
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'assignments'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Assignment Analytics
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard_stats.active_courses}</p>
                </div>
              </div>
              <p className="text-sm text-green-600">
                {dashboard_stats.monthly_growth.courses > 0 
                  ? `+${dashboard_stats.monthly_growth.courses} this month`
                  : 'No change this month'}
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Users className="hd;
sDashboarcherAnalytic default Tea
export
};

  );>/div  <      )}
     </div>
/div>
       <>
        div       </))}
                  </div>
                 iv>
 </d             </div>
                            </div>
            div>
          ></                 %` }}
   ercentage}.grade_passignment{ width: `${    style={                  
     }`}                     00'
     'bg-red-5  :                     00'
       'bg-yellow-5    ?                           ge >= 60
tacenrade_pergnment.g: assi                              een-500'
? 'bg-gr                              >= 80
 entage_percgradesignment.       as                    ull ${
 ed-f{`h-2 round className=                        
 v         <di              
  h-2">d-fullde0 rounbg-gray-20x-1 Name="fle classiv      <d            -2">
    ter gap-cenemslex itme="f classNa<div                  3">
  ame="mt-classN <div            v>
      /di     <       iv>
       </d            p>
       _points}</t.max{assignmen">ray-900um text-g="font-medip className     <             ts</p>
     Poin>Maxgray-600"e="text-ssNam    <p cla                      <div>
                
</div>                  }</p>
  ionsmissgraded_subnt.ignme0">{ass90m text-gray-iu-medame="fontclassN<p                       raded</p>
ray-600">G"text-glassName=  <p c                  <div>
             
         iv>        </d            </p>
                   (1)}%)
   toFixedission_rate.t.submsignmen} ({assubmissionsnt.total_ignmeass           {        >
     -900"rayt-g-medium tex"font className=       <p               ns</p>
bmissioray-600">Su="text-gp className      <              
         <div>           
   text-sm">ap-4d-cols-3 g gri"gridme= classNa       <div       </div>
                 
     v>       </di        e</p>
     ">Avg Graday-600ext-gr"text-sm tame= classN   <p                %</p>
   toFixed(1)}ntage..grade_percement>{assign-gray-900"bold textfont-xt-lg teassName="  <p cl                  ight">
  t-rName="tex  <div class                 </div>
                     title}</p>
urse_t.co{assignmen600">gray-m text-"text-ssName=las<p c                 h4>
     e}</t_titlsignmenasnment.00">{assigay-9m text-griunt-med"foame=assN <h4 cl                  
   div>    <            -3">
    etween mbrt justify-bs-staex itemme="flsNa clas    <div      
        >d-lg"50 rounde bg-gray-"p-4ame=d} classNnt_imeassignssignment.{aey=div k       <      => (
   ent) p((assignmrmance.magnment_perfostats.assit_assignmen     {        -y-4">
 Name="space  <div class          /div>
       </h3>
     ce<ormannt PerfAssignme900">ay-ld text-grmiboont-selg ftext-ssName=" cla        <h3
      le-600" />xt-purp6 te6 w-ame="h-hart classNPieC  <            >
6"gap-3 mb--center tems"flex iame=<div classN     ">
       00der-gray-2border bor-xl p-6 te rounded-whiame="bgv classN       <di  
 y-6">ce-sName="spa clas  <div     s' && (
 entgnm'assiiveTab === 
      {act} Tab */signments* As      {/      )}

   </div>
    er />
 gressTrackudentPro     <St  >
   div      <
  ents' && ( === 'stud {activeTab*/}
     ents Tab    {/* Stud
      )}
</div>
           </div>
   >
           </div       </div>
          
     </p>            ent!'}
    urrying cob sta Great janageable.ad is m'Worklo  :        
           .'leng scheduh gradi wit on trackkload. Stayerate wor 'Mod     ?           > 20
    es ing_gradpend_stats.board: dash                  k.'
  feedbacr  fo hours up officer settingoad. Consideorklding w gra  ? 'High              0
    > 5es rads.pending_gard_statashbo        {d   ">
       xt-gray-600-sm teextame="tsN     <p clas          ance</h4>
 ad Balorklo0 mb-2">Wray-90dium text-gmet-e="fonNam class      <h4         g p-4">
 e rounded-lbg-whitName="ssiv cla<d           </div>
                    </p>
      
       students.'}opics with ficult tw difntion. Revieteds atce neeorman  : 'Perf                 ls.'
 teria support ma additionalonsidermance. Cage perfor 'Aver  ?            60
      e >= rage_gradats.avegnment_stssi       : a        s.'
      methodngchitean current ell. Maintairforming w pedents are    ? 'Stu            0
     8age_grade >=t_stats.aver  {assignmen              y-600">
  gratext-text-sm "assName=     <p cl           d</h4>
enance Trrmfomb-2">Per900 text-gray-t-medium ame="fonsN clas     <h4    ">
       ed-lg p-4e round-whitme="bgv classNa<di              
    </div>
          /p>    <         nes.'}
   s and deadlierialse mateview cour detected. Rgagementow en : 'L             '
      e elements.ivctnterare ier adding moent. ConsidGood engagem  ? '         0
         te >= 6mpletion_racotats.ssignment_s : a                  pating.'
 particiely iv actts aret! Studenemen engaglent'Excel  ?                   e >= 80 
mpletion_rat.cotsnt_sta   {assignme        ">
       ay-600-grxt-sm text"teName=   <p class           ent</h4>
   Engagem">Student-900 mb-2xt-grayum teont-medisName="f clas<h4         ">
       lg p-4ounded-ite r"bg-whe=classNam     <div 
         "> gap-4ols-3 md:grid-c grid-cols-1Name="gridiv class   <d      
       </div>
        hts</h3>eness Insigctiving Effe0">Teachy-90ld text-grat-semibot-lg fon"texlassName=     <h3 c  iv>
       /d        </>
      white" -5 w-5 text-ame="ht classN  <Targe          -lg">
    p-2 rounded-600 -600 to-bluefrom-purpleient-to-r ad="bg-griv className        <d      -4">
er gap-3 mb items-centlexassName="f cl    <div    ">
    rple-200r border-puorde6 bunded-xl p-blue-50 ro0 to-ple-5urfrom-po-r g-gradient-te="bv classNam         <diness */}
 veing Effecti  {/* Teach
        div>
      </
       </div>                 )}
iv>
       </d               /p>
ork<grading wNo pending ay-600">me="text-grsNa     <p clas          />
    3"uto mb--agray-400 mx2 text-e="h-12 w-1classNamileText        <F           py-8">
 er"text-centame= <div classN       (
                ) : v>
         </di         )}
       )          >
     </div                    /div>
      <              n>
  spa   </                  
   )}ateString(LocaleDdue_date).toate(item. Due: {new D                       ">
  xt-gray-500Name="teassan clsp     <               an>
          </sp            tal
       tos}submissional_ot.t {itemending /missions} ppending_subm.  {ite                     ">
   00ay-6e="text-grpan classNam <s               
        ">ext-smy-between tustifter js-cenem"flex itv className=  <di                 v>
          </di           /span>
              <         ty}
     tem.priori  {i               >
           }`}                    00'
  en-8re-100 text-g'bg-green :                          w-800'
  ello-ylow-100 textbg-yel  ? '                     
     dium'me== 'm.priority =       : ite                   
  xt-red-800' tebg-red-100? '                        
     'high'ority ===  item.pri                      
   full ${ rounded-nt-medium text-xs fox-2 py-1{`psName=n clas     <spa                   iv>
        </d               }</p>
 tle.course_ti">{item00text-gray-6="text-sm ssName  <p cla                 >
       tle}</h4_ti.assignmenttem00">{it-gray-9t-medium tex"foname=sNlas      <h4 c                 ex-1">
   sName="fliv clas  <d                     b-2">
 -between mify justms-starte="flex itessNam <div cla                    ed-lg">
 -50 round4 bg-graysName="p-} clasnt_idssignmeey={item.a <div k             (
      ) => map((item(0, 5).load.slicerading_worktats.gment_s    {assign    
          ">="space-y-3sName  <div clas           ? (
    d.length > 0g_workloas.gradinatignment_stass     {       
   </div>           </h3>
  ing Workload900">Grady-rat-gbold texnt-semitext-lg foName="<h3 class              />
  w-600"  text-yelloe="h-6 w-6ssNamclak Cloc      <         mb-6">
  -3er gapentx items-csName="fleclasiv      <d         ">
00-2grayr border-rdeed-xl p-6 bondouhite rg-wsName="b  <div clas          d */}
g WorkloaGradin      {/* 

        </div>      
    </div>       
         </div>          /span>
    d(1)}<Fixee.togradts.average_sta{assignment_">urple-900text-pont-bold text-xl f"className=span   <           
     ade</span>e Gr">Averagy-700t-grassName="tex   <span cla              >
 d-lg"roundeg-purple-50 een p-4 bify-betwstcenter juex items-ssName="flla   <div c      
       v>di          </     %</span>
 ed(1)}n_rate.toFixios.completstatignment_">{ass-blue-900ext tfont-boldext-xl Name="t<span class             
     te</span>etion Rapl700">Com"text-gray-=ssName <span cla            g">
     -loundedg-blue-50 ren p-4 btify-betwecenter jusms-itex sName="flev clas         <di    v>
       </di         
   }</span>bmissionsaded_su_stats.grssignmentn-900">{at-greeld texl font-bot-x"texsName=n clas   <spa       >
        ssions</span Submied0">Grad-70="text-grayn className       <spa          -lg">
  rounded-50bg-greentween p-4 stify-bems-center julex itesName="fdiv clas          <div>
       </             
  ns}</span>ubmissioding_snt_stats.penassignme>{-900" text-yellowl font-boldext-xme="tssNa<span cla            pan>
      ns</sissioending Subm700">P"text-gray-sName=<span clas           
       g"> rounded-l50ow-bg-yell p-4 etweentify-benter jusflex items-className=" c       <div       iv>
         </d         
an>ts}</spssignmenal_at_stats.tot{assignmenay-900">text-gr-bold text-xl fontame="span classN           <   span>
    nts</l Assignme0">Totagray-70xt-e="te classNam  <span             lg">
   0 rounded- bg-gray-5een p-4justify-betwtems-center x ime="fleiv classNa      <d       -4">
   -y"space=v classNamedi  <              </div>
          /h3>
  view<ent Over>Assignmy-900"d text-graemibolt-sonext-lg fame="t<h3 classN               >
 ue-600" /t-bl tex-6 w-6e="h classNamrChart3 <Ba               
p-3 mb-6">ms-center ga="flex itessName    <div cla         ">
 y-200rder-graorder bo bxl p-6ite rounded-me="bg-wh<div classNa         ">
   ls-2 gap-81 lg:grid-co-cols-"grid gridame=<div classN      
    tistics */}t StaAssignmen  {/*       >

   </div         
 </div>          >
    </p         }
  onth'nge this mo cha      : 'N           month`
 s )} thitoFixed(1e.rating_changowth.monthly_grs.shboard_stat${da ? '+' : ''}hange > 0rating_cth.y_growhl_stats.mont`${dashboard     ?             !== 0
  ating_change_growth.rts.monthlystaoard_shbda        {      ">
  gray-600 text-xt-smssName="te      <p cla        </div>
            v>
      </di  
          d(1)}</p>ating.toFixecourse_rts.ard_sta{dashbo-gray-900">t-bold textfonl t-2x"texame=  <p classN          </p>
      urse Ratingay-600">Co text-grummedit-on"text-sm fclassName=   <p              
   <div>      >
         </div             >
   e-600" /-purpl-6 texte="h-6 wassNamard cl  <Aw     
           lg">ded-ounp-3 rle-100 -purpbgName="<div class                >
4" mb-nter gap-3s-ce"flex item=ssName cla<div     >
         200"gray-er border- bordunded-xl p-6 roitewhe="bg-sNamclas     <div       

   </div>    >
        </p            
!'}t up 'All caughiew' : rev 'Needs 0 ?es >adending_grs.pboard_stat   {dash          ">
   xt-gray-600sm teName="text-lass      <p c       v>
        </di  
      </div>      >
         des}</png_grapenditats.dashboard_s900">{text-gray-t-bold l fon-2xsName="textlas<p c           
       s</p> Gradeingy-600">Pendm text-grat-medium fontext-s="p className         <          <div>
            
   /div>         <>
       " /00ow-6xt-yell6 w-6 te"h-=NameeText class  <Fil             -lg">
   -3 roundedlow-100 p-yelsName="bgasiv cl        <d      
  b-4"> mr gap-3tems-cene="flex iteamssN   <div cla          ">
 gray-200der border-l p-6 borrounded-xwhite e="bg-sNamas     <div cl

            </div>
       /p>           <   h'}
e this monthang  : 'No c           `
      monthnts} thisdegrowth.stuthly_.mon_stats{dashboard+$   ? `         0 
       > wth.studentsgrothly_stats.monboard_  {dash           
   n-600">-greetext-sm textme="assNacl   <p    
              </div>        /div>
 <             ts}</p>
  tudentotal_srd_stats.dashboaay-900">{bold text-gront-ext-2xl fme="t  <p classNa      
          udents</p>">Total St0ay-60m text-gront-mediuext-sm f"tsName=las<p c         
         iv>   <d        
     </div>         
       -600" />text-green-6 -6 w