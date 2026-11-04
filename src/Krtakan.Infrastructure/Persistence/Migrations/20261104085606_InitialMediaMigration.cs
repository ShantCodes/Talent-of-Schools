using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Krtakan.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialMediaMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RelativePath",
                table: "Media",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RelativePath",
                table: "Media");
        }
    }
}
