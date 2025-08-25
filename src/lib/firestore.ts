import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';

export interface User {
  walletAddress: string;
  role: 'backer' | 'creator' | 'admin';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProjectMetadata {
  contractAddress: string;
  title: string;
  description: string;
  image?: string;
  category: string;
  creator: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User operations
export const createUser = async (walletAddress: string, role: User['role']) => {
  const userRef = doc(db, 'users', walletAddress.toLowerCase());
  const userData: User = {
    walletAddress: walletAddress.toLowerCase(),
    role,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  await setDoc(userRef, userData);
  return userData;
};

export const getUser = async (walletAddress: string): Promise<User | null> => {
  const userRef = doc(db, 'users', walletAddress.toLowerCase());
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as User;
  }
  return null;
};

export const updateUserRole = async (walletAddress: string, role: User['role']) => {
  const userRef = doc(db, 'users', walletAddress.toLowerCase());
  await updateDoc(userRef, {
    role,
    updatedAt: Timestamp.now()
  });
};

// Project metadata operations
export const createProjectMetadata = async (
  contractAddress: string,
  title: string,
  description: string,
  category: string,
  creator: string,
  image?: string
) => {
  const projectRef = doc(db, 'projects', contractAddress.toLowerCase());
  const projectData: ProjectMetadata = {
    contractAddress: contractAddress.toLowerCase(),
    title,
    description,
    image,
    category,
    creator: creator.toLowerCase(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
  
  await setDoc(projectRef, projectData);
  return projectData;
};

export const getProjectMetadata = async (contractAddress: string): Promise<ProjectMetadata | null> => {
  const projectRef = doc(db, 'projects', contractAddress.toLowerCase());
  const projectSnap = await getDoc(projectRef);
  
  if (projectSnap.exists()) {
    return projectSnap.data() as ProjectMetadata;
  }
  return null;
};

export const getAllProjectsMetadata = async (): Promise<ProjectMetadata[]> => {
  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as ProjectMetadata);
};

export const getCreatorProjects = async (creatorAddress: string): Promise<ProjectMetadata[]> => {
  const projectsRef = collection(db, 'projects');
  const q = query(
    projectsRef, 
    where('creator', '==', creatorAddress.toLowerCase()),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => doc.data() as ProjectMetadata);
};

export const updateProjectMetadata = async (
  contractAddress: string,
  updates: Partial<Omit<ProjectMetadata, 'contractAddress' | 'creator' | 'createdAt'>>
) => {
  const projectRef = doc(db, 'projects', contractAddress.toLowerCase());
  await updateDoc(projectRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};