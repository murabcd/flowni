type NameableUser = {
  id: string;
  email?: string | null;
  name?: string | null;
};

export const getUserName = (user: NameableUser): string => {
  let name = user.id;
  const email = user.email ?? null;

  if (email) {
    name = email;
  }

  if (user.name) {
    name = user.name;
  }

  return name;
};
