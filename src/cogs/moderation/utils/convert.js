const ID_OR_MENTION_REGEX = /^(?:<@!?)(?<MENTION>\d{15,21})>$|^(?<ID>\d{15,21})$/

const idFromArg = (arg) => {
  member = arg.match(ID_OR_MENTION_REGEX)
  if (!member) return null
  return member.groups.MENTION || member.groups.ID
}

const convertIdToMember = async (ctx, member) => {
  id = idFromArg(member)
  if (!id) return null
  member = await ctx.guild.members.fetch(ctx)
  if (!member) return null
  return member
}

const validateId = (member) => {
  id = idFromArg(member)
  if (!id) return null
  return id
}

module.exports = {
  convertIdToMember,
  validateId,
}
