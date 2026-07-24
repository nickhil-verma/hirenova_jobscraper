import { NextResponse } from 'next/server';
import { getCollection } from '../../../../lib/db';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';

export async function POST(req) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sessionsColl = await getCollection('sessions');
    const session = await sessionsColl.findOne({ token });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      skills, jobTitle, experience, contact, achievements, projects,
      title, phoneExtension, addressLine1, addressLine2, city,
      linkedin, xTwitter, github, portfolio, photoPath, photoDataUrl, gpa, educations,
      gender, race, dob, age
    } = body;

    const usersColl = await getCollection('users');
    await usersColl.updateOne(
      { _id: new ObjectId(session.userId) },
      {
        $set: {
          skills: Array.isArray(skills) ? skills.filter(Boolean) : [],
          jobTitle: jobTitle || '',
          experience: experience || '',
          title: title || '',
          phoneExtension: phoneExtension || '',
          addressLine1: addressLine1 || '',
          addressLine2: addressLine2 || '',
          city: city || '',
          linkedin: linkedin || '',
          xTwitter: xTwitter || '',
          github: github || '',
          portfolio: portfolio || '',
          photoPath: photoPath || '',
          photoDataUrl: photoDataUrl || '',
          gpa: gpa || '',
          gender: gender || '',
          race: race || '',
          dob: dob || '',
          age: age || '',
          educations: Array.isArray(educations) ? educations : [],
          contact: {
            email: contact?.email || '',
            phone: contact?.phone || '',
            links: Array.isArray(contact?.links) ? contact.links.filter(Boolean) : []
          },
          achievements: Array.isArray(achievements) ? achievements.filter(Boolean) : [],
          projects: Array.isArray(projects) ? projects.filter(p => p && p.title) : [],
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('[Resume Update API] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
