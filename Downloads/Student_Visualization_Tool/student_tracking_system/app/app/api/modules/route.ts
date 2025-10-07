
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('id');

    // If requesting a specific module
    if (moduleId) {
      const module = await prisma.module.findUnique({
        where: { id: moduleId },
        include: {
          students: true
        }
      });

      if (!module) {
        return NextResponse.json({ error: 'Module not found' }, { status: 404 });
      }

      return NextResponse.json(module);
    }

    // Demo mode - use actual module data with real students
    if (process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder')) {
      console.log('Demo mode: Using actual module data with real students');

      const modules = [
        {
          id: '1',
          code: 'AEM230',
          name: 'Apply Clinical Practicum 1 Ambulance (Diploma)',
          description: 'Applied clinical practicum for diploma students',
          credits: 3,
          semester: 'Fall 2024',
          instructor: 'Elias Thomas',
          students: [
            { id: 'H00600088', fullName: 'Abdulla Mohammed Abdulrahman Saeed Almeqbaali', name: 'Abdulla Mohammed Abdulrahman Saeed Almeqbaali', email: 'h00600088@hct.ac.ae', studentId: 'H00600088' },
            { id: 'H00601780', fullName: 'Afra Saeed Khassib Rashed Alsheryani', name: 'Afra Saeed Khassib Rashed Alsheryani', email: 'h00601780@hct.ac.ae', studentId: 'H00601780' },
            { id: 'H00601770', fullName: 'Shouq Hamad Obaid Hamad Alshamsi', name: 'Shouq Hamad Obaid Hamad Alshamsi', email: 'h00601770@hct.ac.ae', studentId: 'H00601770' },
            { id: 'H00530541', fullName: 'Ahmed Mohammed Khamis Saeed Alyahyaee', name: 'Ahmed Mohammed Khamis Saeed Alyahyaee', email: 'h00530541@hct.ac.ae', studentId: 'H00530541' },
            { id: 'H00594076', fullName: 'Alanoud Salem Saeed Shenain Alnuaimi', name: 'Alanoud Salem Saeed Shenain Alnuaimi', email: 'h00594076@hct.ac.ae', studentId: 'H00594076' },
            { id: 'H00566881', fullName: 'Ali Abdulla Ali Sulaiman Alameri', name: 'Ali Abdulla Ali Sulaiman Alameri', email: 'h00566881@hct.ac.ae', studentId: 'H00566881' },
            { id: 'H00599984', fullName: 'Dheyab Abdallah Ali Saif Almazruii', name: 'Dheyab Abdallah Ali Saif Almazruii', email: 'h00599984@hct.ac.ae', studentId: 'H00599984' },
            { id: 'H00594033', fullName: 'Ghalya Nasser Abdulrahman Nasser Al Ahbabi', name: 'Ghalya Nasser Abdulrahman Nasser Al Ahbabi', email: 'h00594033@hct.ac.ae', studentId: 'H00594033' },
            { id: 'H00594105', fullName: 'Hamad Salim Hamad Mattar Alnaaimi', name: 'Hamad Salim Hamad Mattar Alnaaimi', email: 'h00594105@hct.ac.ae', studentId: 'H00594105' },
            { id: 'H00604014', fullName: 'Latifa Yousef Sultan Abdulla Alshamsi', name: 'Latifa Yousef Sultan Abdulla Alshamsi', email: 'h00604014@hct.ac.ae', studentId: 'H00604014' },
            { id: 'H00601777', fullName: 'Mahra Mohammed Abdulla Khamis Alshamsi', name: 'Mahra Mohammed Abdulla Khamis Alshamsi', email: 'h00601777@hct.ac.ae', studentId: 'H00601777' },
            { id: 'H00593951', fullName: 'Mahra Saif Mohammed Yehal Aldhaheri', name: 'Mahra Saif Mohammed Yehal Aldhaheri', email: 'h00593951@hct.ac.ae', studentId: 'H00593951' },
            { id: 'H00601791', fullName: 'Maitha Ali Mubarak Mohammed Alshamsi', name: 'Maitha Ali Mubarak Mohammed Alshamsi', email: 'h00601791@hct.ac.ae', studentId: 'H00601791' },
            { id: 'H00601746', fullName: 'Mariam Mohammed Ateeq Altheeb Alshamsi', name: 'Mariam Mohammed Ateeq Altheeb Alshamsi', email: 'h00601746@hct.ac.ae', studentId: 'H00601746' },
            { id: 'H00594069', fullName: 'Mariam Mohammed Khalfan Saeed Alshamsi', name: 'Mariam Mohammed Khalfan Saeed Alshamsi', email: 'h00594069@hct.ac.ae', studentId: 'H00594069' },
            { id: 'H00601795', fullName: 'Mariam Obaid Hareb Obaid Alkaabi', name: 'Mariam Obaid Hareb Obaid Alkaabi', email: 'h00601795@hct.ac.ae', studentId: 'H00601795' },
            { id: 'H00601771', fullName: 'Meera Mohammed Rashed Khalifa Alkaabi', name: 'Meera Mohammed Rashed Khalifa Alkaabi', email: 'h00601771@hct.ac.ae', studentId: 'H00601771' },
            { id: 'H00546028', fullName: 'Mohammed Abdulla Mohammed Binreed Alsubousi', name: 'Mohammed Abdulla Mohammed Binreed Alsubousi', email: 'h00546028@hct.ac.ae', studentId: 'H00546028' },
            { id: 'H00609157', fullName: 'Mohammed Khalifa Abdulla Hareb Aldhaheri', name: 'Mohammed Khalifa Abdulla Hareb Aldhaheri', email: 'h00609157@hct.ac.ae', studentId: 'H00609157' },
            { id: 'H00602802', fullName: 'Mohammed Salim Abdallah Humaid Alomairi', name: 'Mohammed Salim Abdallah Humaid Alomairi', email: 'h00602802@hct.ac.ae', studentId: 'H00602802' },
            { id: 'H00571107', fullName: 'Naji Mohammed Bujair Salem Alameri', name: 'Naji Mohammed Bujair Salem Alameri', email: 'h00571107@hct.ac.ae', studentId: 'H00571107' },
            { id: 'H00600056', fullName: 'Ranad Sultan Khamis Khalfan Alyahyaee', name: 'Ranad Sultan Khamis Khalfan Alyahyaee', email: 'h00600056@hct.ac.ae', studentId: 'H00600056' },
            { id: 'H00594034', fullName: 'Rouda Ali Khamis Ali Alkaabi', name: 'Rouda Ali Khamis Ali Alkaabi', email: 'h00594034@hct.ac.ae', studentId: 'H00594034' },
            { id: 'H00542166', fullName: 'Saeed Mohammed Ali Rashed Almeqbaali', name: 'Saeed Mohammed Ali Rashed Almeqbaali', email: 'h00542166@hct.ac.ae', studentId: 'H00542166' },
            { id: 'H00594180', fullName: 'Shamma Ahmed Eid Obaid Alketbi', name: 'Shamma Ahmed Eid Obaid Alketbi', email: 'h00594180@hct.ac.ae', studentId: 'H00594180' },
            { id: 'H00605422', fullName: 'Shamsa Fahed Yousef Abdulla Alsawwafi', name: 'Shamsa Fahed Yousef Abdulla Alsawwafi', email: 'h00605422@hct.ac.ae', studentId: 'H00605422' },
            { id: 'H00600102', fullName: 'Sultan Khulaif Ali Mohammed Alhajeri', name: 'Sultan Khulaif Ali Mohammed Alhajeri', email: 'h00600102@hct.ac.ae', studentId: 'H00600102' },
            { id: 'H00530550', fullName: 'Sultan Salem Ali Ali Aljneibi', name: 'Sultan Salem Ali Ali Aljneibi', email: 'h00530550@hct.ac.ae', studentId: 'H00530550' },
            { id: 'H00502212', fullName: 'Theyab Obaid Ahmed Obaid Albadi', name: 'Theyab Obaid Ahmed Obaid Albadi', email: 'h00502212@hct.ac.ae', studentId: 'H00502212' },
            { id: 'H00594158', fullName: 'Turfa Mohammed Saif Alabed Alnuaimi', name: 'Turfa Mohammed Saif Alabed Alnuaimi', email: 'h00594158@hct.ac.ae', studentId: 'H00594158' }
          ]
        },
        {
          id: '2',
          code: 'HEM2903',
          name: 'Ambulance 1 Practical Group',
          description: 'First-level ambulance practical training',
          credits: 4,
          semester: 'Fall 2024',
          instructor: 'Elias Thomas',
          students: [
            { id: 'H00541559', fullName: 'Afra Subaih Humaid Salem Al Manei', name: 'Afra Subaih Humaid Salem Al Manei', email: 'h00541559@hct.ac.ae', studentId: 'H00541559' },
            { id: 'H00467407', fullName: 'Nahyan Ibrahim Abdulla Ibrahim Alblooshi', name: 'Nahyan Ibrahim Abdulla Ibrahim Alblooshi', email: 'h00467407@hct.ac.ae', studentId: 'H00467407' },
            { id: 'H00467469', fullName: 'Qmasha Imad Wadee Mohammed Aldhaheri', name: 'Qmasha Imad Wadee Mohammed Aldhaheri', email: 'h00467469@hct.ac.ae', studentId: 'H00467469' },
            { id: 'H00467475', fullName: 'Aldana Mohammed Manea Nasser Al Ahbabi', name: 'Aldana Mohammed Manea Nasser Al Ahbabi', email: 'h00467475@hct.ac.ae', studentId: 'H00467475' },
            { id: 'H00491386', fullName: 'Sana Mohammed Nasser Gharib Al Ahbabi', name: 'Sana Mohammed Nasser Gharib Al Ahbabi', email: 'h00491386@hct.ac.ae', studentId: 'H00491386' },
            { id: 'H00491399', fullName: 'Shamayel Ahmed Nashr Alsaadi', name: 'Shamayel Ahmed Nashr Alsaadi', email: 'h00491399@hct.ac.ae', studentId: 'H00491399' },
            { id: 'H00498340', fullName: 'Zayed Mubarak Khamis Kharboush Almansoori', name: 'Zayed Mubarak Khamis Kharboush Almansoori', email: 'h00498340@hct.ac.ae', studentId: 'H00498340' },
            { id: 'H00510900', fullName: 'Athba Saeed Ali Abed Alaryani', name: 'Athba Saeed Ali Abed Alaryani', email: 'h00510900@hct.ac.ae', studentId: 'H00510900' },
            { id: 'H00541555', fullName: 'Mahra Khalifa Mohammed Khalifa Alghafli', name: 'Mahra Khalifa Mohammed Khalifa Alghafli', email: 'h00541555@hct.ac.ae', studentId: 'H00541555' },
            { id: 'H00542172', fullName: 'Talal Mohammed Yousef Abdulla Alblooshi', name: 'Talal Mohammed Yousef Abdulla Alblooshi', email: 'h00542172@hct.ac.ae', studentId: 'H00542172' },
            { id: 'H00542178', fullName: 'Ahmed Tareq Mohmed Ali Alhosani', name: 'Ahmed Tareq Mohmed Ali Alhosani', email: 'h00542178@hct.ac.ae', studentId: 'H00542178' },
            { id: 'H00542183', fullName: 'Shama Juma Saeed Juma Alkaabi', name: 'Shama Juma Saeed Juma Alkaabi', email: 'h00542183@hct.ac.ae', studentId: 'H00542183' },
            { id: 'H00542198', fullName: 'Fatima Abdulla Salem Abdulla Alkaabi', name: 'Fatima Abdulla Salem Abdulla Alkaabi', email: 'h00542198@hct.ac.ae', studentId: 'H00542198' },
            { id: 'H00542199', fullName: 'Shahd Khaled Ali Mohammed Alblooshi', name: 'Shahd Khaled Ali Mohammed Alblooshi', email: 'h00542199@hct.ac.ae', studentId: 'H00542199' },
            { id: 'H00542939', fullName: 'Mohammed Bader Nasser Abdulla Alblooshi', name: 'Mohammed Bader Nasser Abdulla Alblooshi', email: 'h00542939@hct.ac.ae', studentId: 'H00542939' }
          ]
        },
        {
          id: '3',
          code: 'HEM3903',
          name: 'Ambulance Practicum III',
          description: 'Advanced ambulance practicum and emergency response',
          credits: 4,
          semester: 'Fall 2024',
          instructor: 'Elias Thomas',
          students: [
            { id: 'H00459031', fullName: 'Saeed Amer Salem Ahmed Alseiari', name: 'Saeed Amer Salem Ahmed Alseiari', email: 'h00459031@hct.ac.ae', studentId: 'H00459031' },
            { id: 'H00467388', fullName: 'Nahian Abdullah Ali Rashed Al Saadi', name: 'Nahian Abdullah Ali Rashed Al Saadi', email: 'h00467388@hct.ac.ae', studentId: 'H00467388' },
            { id: 'H00491089', fullName: 'Bakhita Saeed Rashed Hedairem Alketbi', name: 'Bakhita Saeed Rashed Hedairem Alketbi', email: 'h00491089@hct.ac.ae', studentId: 'H00491089' },
            { id: 'H00491239', fullName: 'Sherina Obaid Ali Rashed Aljahoori', name: 'Sherina Obaid Ali Rashed Aljahoori', email: 'h00491239@hct.ac.ae', studentId: 'H00491239' },
            { id: 'H00491292', fullName: 'Alanood Saif Jawaan Obaid Almansoori', name: 'Alanood Saif Jawaan Obaid Almansoori', email: 'h00491292@hct.ac.ae', studentId: 'H00491292' },
            { id: 'H00491322', fullName: 'Mahra Abdulla Saeed Bakhit Alshebli', name: 'Mahra Abdulla Saeed Bakhit Alshebli', email: 'h00491322@hct.ac.ae', studentId: 'H00491322' },
            { id: 'H00491415', fullName: 'Shamsa Salem Musabbeh Ahmed Alkaabi', name: 'Shamsa Salem Musabbeh Ahmed Alkaabi', email: 'h00491415@hct.ac.ae', studentId: 'H00491415' },
            { id: 'H00513261', fullName: 'Yunis Maaruf', name: 'Yunis Maaruf', email: 'h00513261@hct.ac.ae', studentId: 'H00513261' }
          ]
        },
        {
          id: '4',
          code: 'HEM3923',
          name: 'Responder Practicum I',
          description: 'First responder training and practical application',
          credits: 3,
          semester: 'Fall 2024',
          instructor: 'Elias Thomas',
          students: [
            { id: 'H00441453', fullName: 'Abdulhamid Bashar Abdulla Hasan Alhaddad', name: 'Abdulhamid Bashar Abdulla Hasan Alhaddad', email: 'h00441453@hct.ac.ae', studentId: 'H00441453' },
            { id: 'H00459151', fullName: 'Aysha Helal Humaid Anad Alkaabi', name: 'Aysha Helal Humaid Anad Alkaabi', email: 'h00459151@hct.ac.ae', studentId: 'H00459151' },
            { id: 'H00461314', fullName: 'Fatima Ali Saif Ablan Almazrouei', name: 'Fatima Ali Saif Ablan Almazrouei', email: 'h00461314@hct.ac.ae', studentId: 'H00461314' },
            { id: 'H00461337', fullName: 'Alreem Ahmed Saif Mohammed Alameri', name: 'Alreem Ahmed Saif Mohammed Alameri', email: 'h00461337@hct.ac.ae', studentId: 'H00461337' },
            { id: 'H00490995', fullName: 'Mohammed Nasser Khamis Salem Aleissaee', name: 'Mohammed Nasser Khamis Salem Aleissaee', email: 'h00490995@hct.ac.ae', studentId: 'H00490995' },
            { id: 'H00495808', fullName: 'Elyazia Jumaa Ahmad Haji', name: 'Elyazia Jumaa Ahmad Haji', email: 'h00495808@hct.ac.ae', studentId: 'H00495808' }
          ]
        }
      ];

      return NextResponse.json({ modules });
    }

    const modules = await prisma.module.findMany({
      include: {
        students: true
      },
      orderBy: {
        code: 'asc'
      }
    });

    return NextResponse.json({ modules });
  } catch (error) {
    console.error('Get modules error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}
